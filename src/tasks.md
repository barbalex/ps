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

lets build lists using https://tanstack.com/virtual/latest / https://github.com/TanStack/virtual

---

tree building: optimizable?

→ WIP on branch `virtualized_tree`: apf2's virtualized-tree method ported.

Done:
- infra in `src/components/Tree/virtual/`: registry atoms, generic Registrar (runs each node type's navData hook and registers its row + children descriptors), useVisibleTreeRows walker, FocusPathLoader + scrollToIndex scroll-into-view (exact row, deepest-ancestor fallback)
- `Tree/index.tsx` window-renders via @tanstack/react-virtual (22px estimate, measureElement), uniform onClickButton port, live isOpen/isActive per row
- configs for the main spine: projects/project/subprojects/subproject/places/place/goals/goal/goalReports/files/file/checks/actions/charts/observations folders/users/user/accounts/messages/message/queuedOperations
- old tree components kept as reference (dead code) until conversion completes

Remaining:
- live verification in the user's browser (dev sync stalls in automation context; typecheck + vitest 95/95 pass)
- convert: check, action, place children conditions (filtered views), designing-only branches (wms/wfs/vector/lists/taxonomies/units/crs/placeLevels/fields/filteredViews/qcs/exports...), i18n labels for formLink rows (currently hardcoded German placeholders)
- indentation levels partly approximated (formLink children)
- then delete the old Tree components

---

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

---

question: can't we just create a dump of the apflora project (in the structure it becomes inside ps) from which we will import into ps? Then all the id's already exist. Would be a great **first step to enabling exporting into dumps and re-importing from dumps in the ui**

---

ensure apflora import is complete (dropdown lists etc.)

---

check translations
