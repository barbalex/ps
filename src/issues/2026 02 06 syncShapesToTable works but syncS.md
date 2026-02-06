title: syncShapesToTables weird behaviour

I have implemented syncShapesToTables but syncing from server does not work relyably. More precise:

- When I change a value on the backend that change syncs exactly once. After that first time no more. No errors are shown. This happens on table accounts
- Table users syncs every time
- When user was changed accounts will sync on the next change angain. But again: only once

My implementation: https://github.com/barbalex/ps/blob/ecf86b06ee248bdbfa57473c90dabb9240f74e86/src/modules/startSyncing.ts

Could it be that the schema used is too complex? (58 tables, https://github.com/barbalex/ps/blob/b2ed0d81bf30370023e286e31f4ea625e636300c/backend/db/init/03_createTables.sql)
