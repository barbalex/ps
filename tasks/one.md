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

---

---

TODO: exports: filter by app-filter

Lets implement the ability to apply a filter that was set in a filter form to an export. In order to do this an export needs to have a 'base_table' this filter can be applied to. So lets add that first to:

- the exports table
- the project_exports table
- the exports.csv file (please set the value i.e. table name too)
- the script importing exports from exports.csv

Lets add the base_table input to the exports and project_exports forms.

in the views at /data/exports-run, /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/exports-run and /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subprojects/018cfd27-ee92-7000-b678-e75497d6c60e/exports-run:

_IF_ base_table has a value and a filter is set on that table: render a checkbox 'apply current filter'.
If that checkbox is checked when an export is clicked, apply the filter to the export query.

---

---

---

---

---

---
