---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

---

wait. why are you deleting all the references in /home/alex/Documents/GitHub/ps/src/sql/createTables.sql? 
1. Nowhere do electric or pglite declare that the synced databases cant be exactly same, including references. If not they would explicitely and very front pagey have to tell users that only a single db should get references, all others that electric syncs to should not 
2. A lot of behaviour assumes these references work 
3. the app has sql initialization code at three places (here, /home/alex/Documents/GitHub/ps/backend/db/init/04_createTables.sql, /home/alex/Documents/GitHub/ps/backend-dev/db/init/04_createTables.sql) and a sync-sql script to sync them. It's no good to change only in this file

---

---

---

---

---

---
