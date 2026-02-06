title: syncShapesToTables weird behaviour

I have implemented syncShapesToTables but syncing from server does not work reliably.
My app contains 58 tables (https://github.com/barbalex/ps/blob/b2ed0d81bf30370023e286e31f4ea625e636300c/backend/db/init/03_createTables.sql) and a few dozen triggers.

When sync starts, 409 conflicts are raised for every synced table. Example: GET http://localhost:3000/v1/shape?columns=user\*id%2Cemail%2Ccreated*at%2Cupdated_at%2Cupdated_by&handle=40225529-1770113101648752&log=full&offset=0_0&table=users 409 (Conflict). This does not *seem\* to have any influence(?).

When only table "users" is synced: Happy times. Syncing reliably works.

When only tables "users" and "accounts" are synced:

- "users" syncs every time (when I change a value on the backend)
- "accounts" syncs exactly once. After that first time no more. No errors are shown
- When "users" was changed "accounts" will sync on the next change angain. But: only once

When table "projects" is also synced:

- I need to sync a few lookup-tables as well ("project_types", "vector_layer_types", "vector_layer_own_tables", "vector_layer_marker_types", "vector_layer_line_caps", "vector_layer_line_joins", "vector_layer_fill_rules"). Reasons: projects.type needs "project_types". When a project is inserted, triggers build vector_layers and their displays. These need the other lookups
- on reloading the app it seems to sync exactly once
- nothing syncs from backend to frontend any more after that. There seem to be exceptions to this rule, were things (I saw this once for projects) synced exactly once more but no more after that
- no specific errors (besides the 409's)

My implementation: https://github.com/barbalex/ps/blob/ecf86b06ee248bdbfa57473c90dabb9240f74e86/src/modules/startSyncing.ts

Could it be that the schema used is too complex? I am getting the impression that using the features of a real database (relations, triggers, always generated values) make syncing hard. I have built relatively complex syncing apps before - but they had these features only server side. App-side they used IndexedDB.

I once tried to use multiple syncShapesToTable instead of syncShapesToTables. The outcome was similar as far as I can remember.

TODO:

- try not creating triggers?
