title: syncShapesToTables weird behaviour

I have implemented syncShapesToTables but syncing from server does not work reliably.
My app (https://github.com/barbalex/ps) contains 58 tables ([backend/db/init/03_createTables.sql](https://github.com/barbalex/ps/blob/0ff737ea76ddeb024e249ef05ae7c1310a7a5df6/backend/db/init/03_createTables.sql) and a few dozen triggers (https://github.com/barbalex/ps/blob/07443638b7a391f539fef058a1d2e5fe4495a71c/backend/db/init/05_triggers.sql, https://github.com/barbalex/ps/blob/07443638b7a391f539fef058a1d2e5fe4495a71c/backend/db/init/04_triggers_updated_at.sql).

When sync starts, 409 conflicts are raised for every synced table. Example: GET http://localhost:3000/v1/shape?columns=user\*id%2Cemail%2Ccreated*at%2Cupdated_at%2Cupdated_by&handle=40225529-1770113101648752&log=full&offset=0_0&table=users 409 (Conflict).
This does not *seem\* to have any influence(?).

When only table "users" is synced: Happy times. Syncing reliably works.

When only tables "users" and "accounts" are synced:

- "users" syncs every time (when I change a value on the backend)
- "accounts" syncs exactly once. After that first time no more. No errors are shown
- When "users" was changed "accounts" will sync on the next change angain. But: only once

When table "projects" is also synced:

- I need to sync a few lookup-tables as well
  ("project_types", "vector_layer_types", "vector_layer_own_tables", "vector_layer_marker_types", "vector_layer_line_caps", "vector_layer_line_joins", "vector_layer_fill_rules"). Reasons: projects.type needs "project_types". When a project is inserted, triggers build vector_layers and their displays. These need the other lookups
- On reloading the app it seems to sync exactly once. But often not at all
- Nothing syncs from backend to frontend any more after that. There seem to be exceptions to this rule, where things (I saw this once for projects) synced exactly once more but no more after that
- No specific errors (besides the 409's)

My sync implementation: https://github.com/barbalex/ps/blob/de9c6341772047fdc4e8f5d7408be5d65933170b/src/modules/startSyncing.ts.

Could it be that the schema used is too complex? I am getting the impression that using the features of a real database (relations, triggers, always generated values) make syncing hard. I have built relatively complex syncing apps before - but they had these features only server side. App-side they used IndexedDB.

I once tried to use multiple syncShapesToTable instead of syncShapesToTables. The outcome was similar as far as I can remember.
I also tried initiating the DB without any triggers whatsoever. Did not help.
I also tried removing all GENERATED ALWAYS AS clauses. Did not help.

I unfortunately do not know how to try to get syncing to work. The only Alternative I can see is to sync the data into IndexedDB where relations, triggers and more are not enforced.

I saw one person mention that sancShapesToTables had not worked for him (https://discord.com/channels/933657521581858818/1212676471588520006/1429046422690598963). I'm surprised not to find more, so probably I just haven't implemented it correctly.

**Details**

- @electric-sql/pglite: 0.3.15
- @electric-sql/pglite-react: 0.2.33
- @electric-sql/pglite-sync: 0.4.1
- @electric-sql/pglite-tools: 0.2.20
- using any extensions? Yes: live, electricSync (https://github.com/barbalex/ps/blob/ecf86b06ee248bdbfa57473c90dabb9240f74e86/src/App.tsx#L40-L47)
- OS: Kubuntu 25.10
- node 24.11.0
