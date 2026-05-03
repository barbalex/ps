---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

---

---

we need to refactor qcs and project_qcs 'is_project_level' and 'is_subproject_level':
1. instead of two boolean values we need a crs_level_enum containing two values: 'project' and 'subproject'
2. in the forms, this is shown as a radio input. its label is: ' is translated and, for project_crs, uses the name for the subproject defined in the project table 

---

qcs and project_qcs: explain how label translations work, like somewhere else (where?). Fallback de

---

---

---

---

---

---

---

sudo do-release-upgrade -d
