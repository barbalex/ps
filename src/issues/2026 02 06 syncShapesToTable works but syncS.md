title: syncShapesToTable works but syncShapesToTables not?

I have implemented syncShapesToTables but syncing from server to client has not worked. More precise: When I change a value on the backend that change syncs exactly once. After that first time no more. No errors are shown.

Then I saw @debugverma_74597 mentioning that syncShapesToTables had not worked for him (https://discord.com/channels/933657521581858818/1212676471588520006/1429046422690598963).

So I tried using syncShapeToTable instead. And it works (for a single table, not when I try to get it work for all 58).

Have I made a mistake or is there a bug in syncShapesToTables?

My implementation using syncShapesToTables: https://github.com/barbalex/ps/blob/ecf86b06ee248bdbfa57473c90dabb9240f74e86/src/modules/startSyncing.ts

My implementation using syncShapeToTable for just the projects table: https://github.com/barbalex/ps/blob/679bd4256d48151e43167146b143892208b5ff9a/src/modules/startSyncingProjects.ts

Could it be that the schema used is too complex? (58 tables, https://github.com/barbalex/ps/blob/b2ed0d81bf30370023e286e31f4ea625e636300c/backend/db/init/03_createTables.sql)
