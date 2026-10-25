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

would it make sense to use Tanstack Start for this app? https://tanstack.com/start/latest

---

would it make sense to use Tanstack Redact instead of React? https://tanstack.com/redact/latest

---

Upstream issue — yes, worth filing

https://github.com/electric-sql/pglite/issues

It's a clean, actionable library improvement: pglite's live extension creates statement-level notify triggers without an electric.syncing gate, so every sync apply statement re-runs all mounted live queries through the same serialized queue the applies use; gating the notify (and offering a settle-hook or auto-notify-on-up-to-date) would remove that amplification. Suggested text (file against electric-sql/pglite, title like "live extension: notify triggers should not fire during electric sync applies"):

Problem: The live extension creates AFTER INSERT OR UPDATE OR DELETE ... FOR EACH STATEMENT triggers that unconditionally pg_notify (table_change__<schema_oid>__<table_oid>). Electric sync applies run with electric.syncing set, but these triggers don't check it. Consequence: during a large sync (or a shape 409 re-snapshot), every apply statement re-runs every mounted live query — through the same single serialized query queue the applies themselves use. With ~50 shapes streaming and hundreds of mounted live queries, this multiplies sync time and memory usage and starves interactive reads.

Workaround we use: after boot, replace the _notify_* function bodies with a gating check (IF current_setting('electric.syncing', true)::boolean THEN RETURN NULL), and fire one manual notification round when the sync object goes up-to-date.

Suggested fix: gate the trigger function on electric.syncing, and (for queries mounted mid-sync) provide a settle hook or automatically notify affected tables once a sync transaction batch reports up-to-date.

---

---

---

---

---

question: can't we just create a dump of the apflora project (in the structure it becomes inside ps) from which we will import into ps? Then all the id's already exist. Would be a great **first step to enabling exporting into dumps and re-importing from dumps in the ui**

---

ensure apflora import is complete (dropdown lists etc.)

---

check translations
