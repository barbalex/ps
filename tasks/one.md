---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

---

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
