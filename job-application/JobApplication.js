/**
 * AI-POWERED JOB TRACKER (BATCH MODE)
 * Structure: S/N | Date | Company | Title | Status | Cleaned | Updated
 */

// --- CONFIGURATION ---
const SPREADSHEET_ID = '1G2ulJUy3cx2imjpdhTmRD0rjPMbvoE6OifcAH-1oOkk';
const SHEET_NAME = 'All Job applications'; 
const DAILY_LOOKBACK_DAYS = 1;
const BATCH_SIZE = 10; 

// *** API KEY CONFIGURED ***
const GEMINI_API_KEY = 'AIzaSyAljMsea1SmXA47gSdkOOG3uj-NcMR0-KY'; 

const SEARCH_QUERIES = [
  '("application" OR "interview" OR "offer" OR "candidate" OR "hiring team") -subject:("job alert" OR "digest" OR "newsletter")',
  'from:("greenhouse.io" OR "lever.co" OR "workday.com" OR "ashbyhq.com" OR "smartrecruiters.com" OR "bamboohr.com")'
];

/**
 * 1. DAILY TRIGGER
 */
function mainJobTracker() {
  const date = new Date();
  date.setDate(date.getDate() - DAILY_LOOKBACK_DAYS);
  const dateString = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd");
  console.log(`Starting Daily Batch Scan after: ${dateString}`);
  processEmails(`after:${dateString}`);
}

/**
 * 2. FULL SCAN (Manual)
 */
function runFullScan() {
  const START_DATE = "2025/10/01"; 
  const END_DATE = "2025/11/21"; 
  console.log(`Starting Full Batch Scan from ${START_DATE} to ${END_DATE}`);
  processEmails(`after:${START_DATE} before:${END_DATE}`);
}

// --- CORE PROCESSING ---

function processEmails(timeQuery) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  let existingData = [];
  
  // Fetch all 7 columns (A to G) to verify existing companies
  if (lastRow > 1) {
    existingData = sheet.getRange(2, 1, lastRow - 1, 7).getValues(); 
  }

  let emailBatch = [];
  const processedIds = []; 

  SEARCH_QUERIES.forEach(baseQuery => {
    const searchString = `${baseQuery} ${timeQuery}`;
    const threads = GmailApp.search(searchString, 0, 60); 

    threads.forEach(thread => {
      if (processedIds.includes(thread.getId())) return;
      processedIds.push(thread.getId());

      const messages = thread.getMessages();
      const latestMsg = messages[messages.length - 1]; 
      
      emailBatch.push({
        id: thread.getId(),
        subject: latestMsg.getSubject(),
        body: latestMsg.getPlainBody().substring(0, 1500), 
        sender: latestMsg.getFrom(),
        date: latestMsg.getDate()
      });

      if (emailBatch.length >= BATCH_SIZE) {
        processBatch(sheet, existingData, emailBatch);
        emailBatch = []; 
        Utilities.sleep(2000); 
      }
    });
  });

  if (emailBatch.length > 0) {
    processBatch(sheet, existingData, emailBatch);
  }
}

/**
 * ANALYZE BATCH WITH GEMINI
 */
function processBatch(sheet, existingData, batch) {
  console.log(`Processing batch of ${batch.length} emails...`);
  
  let batchText = "";
  batch.forEach((email, index) => {
    batchText += `\n--- EMAIL ID ${index} ---\nFrom: ${email.sender}\nSubject: ${email.subject}\nBody Snippet: ${email.body}\n`;
  });

  const prompt = `
    You are an expert HR tracking system. I will provide ${batch.length} emails.
    Analyze EACH email to determine if it is a job application update.
    
    EMAILS TO ANALYZE:
    ${batchText}

    RULES:
    1. Ignore newsletters, spam, or "job alerts". Only track specific applications the user applied to.
    2. Extract Company Name (clean format).
    3. Extract Job Title (or "General Application").
    4. Statuses: "Application Received", "Interview", "Assessment", "Declined", "Offer", "Action Required".
    
    OUTPUT FORMAT:
    Return a JSON Object with a single key "results" containing an array of objects.
    Order must match the input emails (ID 0 to ${batch.length - 1}).
    
    Example JSON:
    {
      "results": [
        { "id": 0, "is_job_related": true, "company": "Google", "title": "Analyst", "status": "Interview" },
        { "id": 1, "is_job_related": false }
      ]
    }
  `;

  const jsonResponse = callGeminiAPI(prompt);

  if (!jsonResponse || !jsonResponse.results) {
    console.log("Batch processing failed or returned invalid JSON.");
    return;
  }

  jsonResponse.results.forEach(result => {
    if (result.is_job_related && result.company && result.company !== "Unknown") {
      const originalEmail = batch[result.id]; 
      if (originalEmail) {
        updateOrAddRow(sheet, existingData, originalEmail.date, result);
      }
    }
  });
}

function callGeminiAPI(prompt) {
  if (!GEMINI_API_KEY) throw new Error("API Key Missing");
  
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    "contents": [{ "parts": [{ "text": prompt }] }]
  };

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      console.log(`API Error (${response.getResponseCode()}): ${response.getContentText()}`);
      return null;
    }

    const json = JSON.parse(response.getContentText());
    if (!json.candidates || !json.candidates[0]) return null;

    const rawText = json.candidates[0].content.parts[0].text;
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson);

  } catch (e) {
    console.log("Gemini Exception: " + e.toString());
    return null;
  }
}

/**
 * HELPER: Derive Clean Status from Raw Status
 */
function deriveCleanStatus(rawStatus) {
  const s = rawStatus.toLowerCase();
  
  if (s.includes("application received") || s.includes("sent") || s.includes("submitted")) {
    return "Application Received";
  }
  if (s.includes("declined") || s.includes("rejected") || s.includes("closed") || s.includes("not proceeding")) {
    return "Declined";
  }
  if (s.includes("interview") || s.includes("assessment") || s.includes("screen") || s.includes("invited")) {
    return "Moved forward to interview";
  }
  return "Other";
}

function updateOrAddRow(sheet, existingData, date, result) {
  const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "MMM dd, yyyy");
  const company = result.company;
  const status = result.status;
  const title = result.title;
  const cleanStatus = deriveCleanStatus(status);

  // --- DUPLICATE CHECKING LOGIC (Corrected for S/N Column) ---
  // Structure: [0]S/N | [1]Date | [2]Company | [3]Title | [4]Status | [5]Cleaned | [6]Updated
  let foundIndex = -1;
  for (let i = 0; i < existingData.length; i++) {
    // COMPANY IS NOW INDEX 2 (Column C)
    const existingCompany = existingData[i][2].toString().toLowerCase(); 
    const newCompany = company.toLowerCase();
    
    // Robust matching
    if (existingCompany === newCompany || 
       (existingCompany.includes(newCompany) && newCompany.length > 4) || 
       (newCompany.includes(existingCompany) && existingCompany.length > 4)) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex > -1) {
    // --- UPDATE EXISTING ---
    // Row number is Index + 2 (because of Header + 0-index)
    const rowNumber = foundIndex + 2; 
    
    // CURRENT STATUS IS NOW INDEX 4 (Column E)
    const currentStatus = existingData[foundIndex][4]; 
    
    // Update Last Update (Column G / Index 7 in sheet terms)
    sheet.getRange(rowNumber, 7).setValue(formattedDate); 

    const weakStatuses = ["Application Received"];
    const isUpgrade = !weakStatuses.includes(status);
    const isSame = status === currentStatus;
    
    // Update status only if meaningful change
    if (!isSame && (isUpgrade || weakStatuses.includes(currentStatus))) {
       sheet.getRange(rowNumber, 5).setValue(status);      // Col E (Status)
       sheet.getRange(rowNumber, 6).setValue(cleanStatus); // Col F (Cleaned)
       console.log(`Updated ${company}: ${status} -> ${cleanStatus}`);
    } else {
       console.log(`Updated Date only for ${company}`);
    }

  } else {
    // --- ADD NEW ---
    // Calculate next S/N based on the last row's S/N
    let nextSN = 1;
    if (existingData.length > 0) {
      const lastSN = existingData[existingData.length - 1][0]; // Index 0 is S/N
      if (!isNaN(lastSN)) {
        nextSN = parseInt(lastSN) + 1;
      }
    }
    
    // Append Row: S/N | Date | Company | Title | Status | Cleaned | Updated
    sheet.appendRow([nextSN, formattedDate, company, title, status, cleanStatus, formattedDate]);
    
    // Update local cache to prevent duplicate adds in same batch
    existingData.push([nextSN, formattedDate, company, title, status, cleanStatus, formattedDate]);
    console.log(`Added ${company} (S/N: ${nextSN})`);
  }
}