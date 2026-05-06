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

New feature: exports.

Very similar to: qcs.

There are genearal exports, like qcs. And there are project*exports, like project_qcs.
exports are predefined and available in every project, \_if* they are assigned (thus: export_assignments). project_exports on the other hand can be created by owners and designers. And they can be assigned by them, thus project_export_assignments.

Owners and designers can choose which exports to use. Thus routes /data/export-assignments and /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/export-assignments. With nav tree nodes, breadcrumbs and Forms very similar to qcs. Only visible while designing.

There are forms to run exports. Different from qcs/project_qcs in that the queries are not run on render. Rather the user sees a list of buttons that can be ckicked, after which the query is run and the result can be saved as .csv, .xlsx or ods. But a Bericht Jahr can be entered which will be passed into queries using it. And the exports can be filtered by label. We do not need 'Nur mit Befunden'.

---

general exports: import from exports.csv file

---

TODO: docs for exports

---

TODO: filter by app-filter

---

---
