# Appscript Automation

This repository is a collection of Google Apps Script automations managed with [`clasp`](https://github.com/google/clasp) and version-controlled on GitHub.

Each subfolder in this repo represents a **separate Apps Script project**.  
Current projects:

## Repository Structure

```text
appscript-automation/
  foldername/
    .clasp.json       # Links this folder to a specific Apps Script project
    appsscript.json   # Apps Script project configuration
    filename.js # Main script file
  README.md           # This file

Rule of thumb:
One folder = one Apps Script project = one .clasp.json.

You can add more projects later by creating more subfolders that follow the same pattern.

⸻

Prerequisites

To work with any project in this repo you’ll need:
	•	A Google account with access to the corresponding Apps Script project
	•	Node.js￼ (LTS version recommended)
	•	npm (comes with Node)
	•	clasp installed globally:

npm install -g @google/clasp


⸻

Getting Started (for someone cloning the repo)
	1.	Clone the repo

git clone https://github.com/<your-username>/appscript-automation.git
cd appscript-automation


	2.	Install clasp (first time only)

npm install -g @google/clasp


	3.	Log in to clasp (first time only)

clasp login

This opens a browser window. Sign in with the Google account that has access to the Apps Script projects you want to work on.

⸻

Working on an Existing Project (e.g. job-application)
	1.	Go into the project folder

cd appscript-automation/job-application


	2.	Check the Apps Script status (optional but useful)

clasp status

This shows differences between your local files and the remote Apps Script project.

	3.	Edit code
	•	Open the folder in your IDE.
	•	Modify JobApplication.js or create additional .js / .gs files as needed.
	4.	Push changes to Apps Script
When you’re ready to deploy the updated code to Google Apps Script:

clasp push

⚠️ Note: clasp push overwrites the code in the linked Apps Script project with the files from this folder. Make sure your local code is what you want deployed.

	5.	Commit and push changes to GitHub
From the repo root or project folder:

git add .
git commit -m "Describe your change"
git push



⸻

Creating a New Apps Script Project in This Repo

To add a new project (for example, calendar-reminders):
	1.	From the repo root:

cd appscript-automation
mkdir calendar-reminders
cd calendar-reminders


	2.	Option A – Create a brand new Apps Script project

clasp create --type standalone --title "Calendar Reminders"


	3.	Option B – Link to an existing Apps Script project
Get the SCRIPT_ID from the Apps Script URL, then:

clasp clone <SCRIPT_ID>



This will generate a new .clasp.json and appsscript.json inside the new folder.
From then on, you work in that folder and use clasp push just like with job-application.

⸻

Contributing
	1.	Fork the repository (if you’re an external contributor).
	2.	Clone your fork and set up clasp as described above.
	3.	Make changes in the appropriate project folder.
	4.	Use:

clasp push

only if you have permission to update the linked Apps Script project; otherwise, you can:
	•	Create your own Apps Script project
	•	Run clasp create / clasp clone in a new folder
	•	Update .clasp.json to point to your own script

	5.	Commit your changes and open a pull request with a clear description of:
	•	What you changed
	•	Which project folder(s) you touched
	•	Any setup notes

⸻

Typical Workflow Summary
	1.	git pull – get latest changes
	2.	cd <project-folder> – e.g. job-application
	3.	clasp status – see what’s changed (optional)
	4.	Edit code in your IDE
	5.	clasp push – deploy to Apps Script
	6.	Test in Google (run functions / triggers as needed)
	7.	git add . && git commit -m "..." && git push – save to GitHub

⸻

✏️ Feel free to update the project descriptions and commands here to match your exact setup or naming conventions.

If you want a separate, shorter README just for the `job-application` folder, I can generate a second one focused only on that project.