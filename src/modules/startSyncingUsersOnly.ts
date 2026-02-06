import { store, syncingAtom } from '../store.ts'
import { constants } from './constants.ts'

const url = constants.getElectricUri()

export const startSyncingUsersOnly = async (db) => {
  console.log('Sync of projects from server to PGlite initiated')
  store.set(syncingAtom, true)

  const table = 'users'
  const primaryKey = ['user_id']

  let sync
  try {
    sync = await db.electric.syncShapeToTable({
      shape: {
        url,
        params: {
          table,
          columns: [
            'user_id',
            'email',
            'created_at',
            'updated_at',
            'updated_by',
          ],
        },
      },
      table,
      primaryKey,
      shapeKey: `ps-sync-shape-${table}`,
      // initialInsertMethod: 'csv',
      onInitialSync: () => {
        store.set(syncingAtom, false)
        console.log(`initial sync done for table ${table}`)
      },
      onError: (error) => console.error(`Syncer ${table}`, error),
    })
  } catch (error) {
    console.error('Error starting sync:', error)
    store.set(syncingAtom, false)
    throw error
  }

  return sync
}
