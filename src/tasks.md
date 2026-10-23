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

backend-dev db log:

2026-10-23 14:28:58.966 UTC [540] ERROR: permission denied for table subprojects_history_p2025

    CONTEXT: SQL statement "SELECT updated_at::text FROM public.subprojects_history_p2025 LIMIT 1"

    PL/pgSQL function run_maintenance(text,boolean,boolean) line 245 at EXECUTE

    SQL statement "SELECT partman.run_maintenance('public.subprojects_history', p_jobmon := 'f', p_analyze := 'f')"

    PL/pgSQL function partman.run_maintenance_proc(integer,boolean,boolean) line 42 at EXECUTE

    SQL statement "CALL partman.run_maintenance_proc(p_wait => 0, p_analyze => false, p_jobmon => false)"

    DETAIL:

    HINT:

2026-10-23 14:28:58.966 UTC [540] CONTEXT: PL/pgSQL function run_maintenance(text,boolean,boolean) line 492 at RAISE

    SQL statement "SELECT partman.run_maintenance('public.subprojects_history', p_jobmon := 'f', p_analyze := 'f')"

    PL/pgSQL function partman.run_maintenance_proc(integer,boolean,boolean) line 42 at EXECUTE

    SQL statement "CALL partman.run_maintenance_proc(p_wait => 0, p_analyze => false, p_jobmon => false)"

2026-10-23 14:28:58.968 UTC [1] LOG: background worker "pg_partman background worker" (PID 540) exited with exit code 1

---

---

---

---

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
