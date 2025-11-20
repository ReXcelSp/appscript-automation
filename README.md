# Appscript Automation

This repository serves as a monorepo for various Google Apps Script automation projects. Each project is contained within its own subdirectory and is managed using [`clasp`](https://github.com/google/clasp) for version control.

## 📂 Repository Structure

The repository is organized by project. Each folder represents a standalone Apps Script project.

```text
appscript-automation/
├── job-application/       # Project: AI Job Application Tracker
│   ├── .clasp.json        # Project configuration
│   ├── appsscript.json    # Manifest file
│   └── JobApplication.js  # Main script
└── README.md              # This file
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (LTS version recommended)
- **npm** (included with Node.js)
- **clasp** (Google Apps Script CLI)

To install `clasp` globally, run:

```bash
npm install -g @google/clasp
```

### 🔐 Security & Setup

**Important:** This project uses **Script Properties** to store sensitive API keys. Do not commit your keys to GitHub!

1. **Configure Secrets**
   Open `job-application/setup.js` and replace the placeholder values with your actual keys:
   ```javascript
   const SECRETS = {
     'GEMINI_API_KEY': 'YOUR_ACTUAL_KEY',
     'SPREADSHEET_ID': 'YOUR_ACTUAL_ID'
   };
   ```

2. **Push & Run Setup**
   ```bash
   cd job-application
   clasp push
   ```
   Then, open the script in your browser (`clasp open`), select the `setupScriptProperties` function, and click **Run**.

3. **Clean Up**
   Once run, you can revert the changes to `setup.js` or delete the secrets from the file so they aren't committed.

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/appscript-automation.git
   cd appscript-automation
   ```

2. **Login to Google** (One-time setup)
   ```bash
   clasp login
   ```
   This will open a browser window. Sign in with the Google account that manages your scripts.

---

## 🛠️ Workflow

### Working on an Existing Project

1. **Navigate to the project folder**
   ```bash
   cd job-application
   ```

2. **Pull latest changes from Google (Optional)**
   If you or someone else made changes directly in the Apps Script editor:
   ```bash
   clasp pull
   ```

3. **Make your changes**
   Edit the `.js` files in your preferred code editor.

4. **Push changes to Google**
   Deploy your local changes to the Apps Script project:
   ```bash
   clasp push
   ```
   > **⚠️ Warning:** This overwrites the code on Google's servers with your local files.

### Adding a New Project

To add a new automation script (e.g., `calendar-reminders`):

1. **Create a new folder**
   ```bash
   mkdir calendar-reminders
   cd calendar-reminders
   ```

2. **Initialize the project**
   
   **Option A: Create a new script**
   ```bash
   clasp create --type standalone --title "Calendar Reminders"
   ```

   **Option B: Clone an existing script**
   Find the `Script ID` from your project URL (e.g., `https://script.google.com/d/<SCRIPT_ID>/edit`) and run:
   ```bash
   clasp clone <SCRIPT_ID>
   ```

---

## 🤝 Contributing

1. **Fork** the repository.
2. **Clone** your fork locally.
3. Create a **feature branch**: `git checkout -b my-new-feature`.
4. **Commit** your changes: `git commit -m 'Add some feature'`.
5. **Push** to the branch: `git push origin my-new-feature`.
6. Submit a **Pull Request**.