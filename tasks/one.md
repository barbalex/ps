---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

lets optimize loading crs

Currently when starting the app for the first time syncing takes rather long. the main reason is the 10'044 crs that are loaded.

1. Lets not sync table crs any more
2. Lets change the project crs form (/data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/crs/019edb74-e525-7000-9b95-f6eee1401c4c) to fetch crs from the server

We will later remove the ui and code for crs completely: /data/crs list, /data/crs/019aeb6d-6cdb-71c4-924b-8e402195d8cc form, routes, tree nodes, breadcrumbs, use...Data hooks. But wait until 1. and 2. are finished.

---

Lets remove the ui and code for crs completely: /data/crs list, /data/crs/019aeb6d-6cdb-71c4-924b-8e402195d8cc form, routes, tree nodes, breadcrumbs, use...Data hooks

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
