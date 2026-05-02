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

qcs and project_qcs: nach Jahr filtern: explain

---

qcs.sort and project_qcs.sort: remove. Also in history tables

---

---

qcs and project_qcs: explain how label translations work, like somewhere else (where?). Fallback de

---

---

ensure project_qcs are only visible to owners and project designers (nav tree, list views thus use...Data hooks).

---

If you want, I can now add the same history compare flow for project_qcs (like project_crs), so each project_qcs form gets a histories view and toggle

---

---

DOING: project_crs form: 'Teilprojekt-Ebene' should become: '{name of subproject as defined in the projects table}-Ebene'. Also update all translations. Fallback remains 'Teilprojekt-Ebene' (if not defined in the projects table)

TODO: check if also in filter

---

sudo do-release-upgrade -d
