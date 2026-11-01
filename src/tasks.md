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

---

lets grab for the stars: it seems syncing is now working much better. lets import all apflora data for the alex.barbalex@gmail.com user, what apflora:import:all was designed for. Does that still work?

---

http://localhost:5176/data/projects/0195a101-0000-7000-8000-000000000001/subprojects/017d3472-d75d-7095-82f2-34b3a41b09f2/places/017d3475-0435-7bc2-839c-51570ee6422d throws:

index.js?v=3a4e99f1:1 Uncaught (in promise) Error: syntax error at or near "SELECT"
at BroadcastChannel.c (index.js?v=3a4e99f1:1:5629)
c @ index.js?v=3a4e99f1:1
index.js?v=3a4e99f1:1 error: syntax error at or near "SELECT"
at pe.Oe (chunk-EP7TJL7B.js?v=3a4e99f1:1:18223)
at pe.tt (chunk-EP7TJL7B.js?v=3a4e99f1:1:15609)
at pe.parse (chunk-EP7TJL7B.js?v=3a4e99f1:1:14283)
at D.ze (chunk-66APQTYC.js?v=3a4e99f1:5:1759)
at chunk-66APQTYC.js?v=3a4e99f1:5:1151
at pglite.wasm:0x52a5d7
at pglite.wasm:0x2159d1
at pglite.wasm:0x21ce4a
at pglite.wasm:0x21d07f
at pglite.wasm:0x4d6fbb
(anonymous) @ index.js?v=3a4e99f1:1

---

Is there a way to sync/import in batches?

Example when importing a project:

1. First sync project and its top level tables (ensuring relations are respected).
2. Then subprojects one at a time. Only start next sync when last has ended.

This way user could be shown what is syncing and see the already synced subprojects. The user could maybe even start editing as the ui is not being blocked by the syncing.

Not sure if this is a good idea. It focuses on making the user see progress as it takes 30 Minutes.

---

question: can't we just create a dump of the apflora project (in the structure it becomes inside ps) from which we will import into ps? Then all the id's already exist. Would be a great **first step to enabling exporting into dumps and re-importing from dumps in the ui**

---

ensure apflora import is complete (dropdown lists etc.)

---
