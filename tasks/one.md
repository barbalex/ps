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

/data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/qcs: its node in the nav tree should only be visible while designing

---

in project's list view, while designing: many of the nav tree nodes that are children of the project are not shown. they should be

---

/data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subproject-designs's node in nav tree is shown when not designing. Should only be shown while designing, as in the list view. Same for: /designs

---

/data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subproject-designs's node in project list viw is not shown when designing. it should (only when designing). Same for: /designs

sudo do-release-upgrade -d
