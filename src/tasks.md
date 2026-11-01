---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

---

---

---

dark mode not well implemented for: file upload?

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

we have a dump of the apflora project from which we can import into ps. It is a great first step to enabling exporting into dumps and re-importing from dumps in the ui.

lets implement this:

1. in project header (examples: http://localhost:5176/data/projects/0195a101-0000-7000-8000-000000000001, http://localhost:5176/data/projects/0195a101-0000-7000-8000-000000000001/project) new menu button to: 'Export to SQL dumpfile'. Builds the dumpfile, opens save as window
2. in projects list header (http://localhost:5176/data/projects) new menu button: 'Import from SQL dumpfile'. Opens popup form to choose a file or drop one after which the project is imported

---

As implemented in apf2, lets build a deploy script:

- 'npm run deploy' patches version and updates versionDate in package.json, commits and pushes
- then 'production' branch is updated from main and pushed. This lets netlify deploy it. Locally 'main' remains the active branch
- additionally 'npm run deploy' can add 'patch', 'minor' or 'major'. default is 'patch'. tells the script how to update the version number

---

later:

- ensure apflora import is complete (dropdown lists, EKF form ui, more?)
- concerning EKF form ui: this should be generally possible. Use an editor to build the form using images and more? As done for reports?
