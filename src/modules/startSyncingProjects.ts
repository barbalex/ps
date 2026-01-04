import { store, syncingAtom } from '../store.ts'
import { constants } from './constants.ts'

const url = constants.getElectricUri()

export const startSyncingProjects = async (db) => {
  console.log('Sync of projects from server to PGlite initiated')

  const sync = await db.electric.syncShapeToTable({
    shape: {
      url,
      params: { table: 'projects' },
    },
    liveSse: true,
    table: 'projects',
    primaryKey: ['project_id'],
    key: 'ps-sync', // TODO: use user-specific key once auth is implemented
    initialInsertMethod: 'csv',
    onInitialSync: () => {
      store.set(syncingAtom, false)
      console.log('Syncer.startSyncingProjects: initial sync done')
      // setTimeout(() => window.location.reload(true), 1000)
    },
    onError: (error) => console.error('Syncer', error),
  })

  return sync
}
