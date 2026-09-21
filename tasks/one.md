---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

---

done (2026-09-18): found why fresh logins hung on the subproject page and sync dragged on: the users→roles rename (revamp, 2026-08-24) missed the flag columns `projects.subproject_users_in_subproject` and `place_levels.place_users_in_place` — the app queries and sync shape lists used `*_roles_*` names that existed in NO schema. Fixed in: src/sql/createTables.sql + backend/db/init/04_createTables.sql (renamed), SqlInitializer (idempotent DO-block heal for existing local dbs), createRows + startSyncing + models (renamed). NOTE: the running backend database still needs the rename applied (or a reset from the updated init files), otherwise the projects/place_levels shapes will error during sync.

done (2026-09-18): tsc errors reduced to 0 (from 3753) and `npm run build` succeeds. Also fixed while at it: SqlInitializer silently swallowing failures (left "Initializing database" stuck forever), several latent runtime bugs (undefined identifiers in the assignments lists, wrong route param in projects.tsx, imports of non-existent models in placeUser/subprojectUser HistoryCompare).

---

type packages are now installed as dependencies. can't they be installed as dev-dependencies instead?

---

is-uuid hasn't been updated in years. v7 uuid's are new and used here. would it be better to use uuid.validate from the uuid package instead? https://www.npmjs.com/package/uuid#uuidvalidatestr
(if yes: also remove typing in /home/alex/Documents/GitHub/ps/src/untyped-modules.d.ts)

---



---

---

---

---

---

---
