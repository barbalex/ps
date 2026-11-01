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

Implemented. TODO: test

---

---

As implemented recently in vermehrung: Save on blurring form (and all other relevant events) instead of on bluring/changing field.
Why? Reduce history churn. Make edits more comparable, especially when a user checks edits to solve offline created conflicts.
Keep updating data used in other parts of the ui immediately. Mostly labels in nav tree and breadcrumbs.

---

later:

- ensure apflora import is complete (dropdown lists, EKF form ui, more?)
- concerning EKF form ui: this should be generally possible. Use an editor to build the form using images and more? As done for reports?
