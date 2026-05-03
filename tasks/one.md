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

1. instead of two boolean values we need a qcs_level_enum containing two values: 'project' and 'subproject'
2. in the forms, this is shown as a radio input. its label is: 'Auf welcher Ebene wird Qualität kontrolliert?'. the radio's value labels are translated and, for project_qcs, uses the name for the subproject defined in the project table (for qcs 'project' is used, translated)

---

qcs and project_qcs: explain how label translations work, like somewhere else (where?). Fallback de

---

---

---

---

---

---

---

sudo apt update

sudo apt full-upgrade

sudo do-release-upgrade -d
