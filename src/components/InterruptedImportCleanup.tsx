import { useEffect, useRef } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  addNotificationAtom,
  onlineAtom,
  sqlInitializingAtom,
  syncObjectAtom,
} from '../store.ts'
import {
  clearPendingImport,
  deleteProjectOnServer,
  readPendingImport,
} from '../modules/projectDump/importProjectDump.ts'
import { useSession } from '../modules/authClient.ts'

/**
 * A project dump upload interrupted by a reload or tab close leaves a half
 * project on the server (each request is its own transaction) — and the
 * marker the import wrote to localStorage. Once online and syncing, this
 * removes that project again and tells the user to import once more.
 */
export const InterruptedImportCleanup = () => {
  const { formatMessage } = useIntl()
  const online = useAtomValue(onlineAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const syncObject = useAtomValue(syncObjectAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const { data: session } = useSession()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current || !online || sqlInitializing || !syncObject) return
    if (!session?.user) return
    const pending = readPendingImport()
    if (!pending) return
    ran.current = true

    void deleteProjectOnServer(pending.projectId)
      .then((results) => {
        const status = results[0]?.status
        // no-row: the upload had finished after all, or was removed already
        if (status !== 'applied' && status !== 'no-row') {
          throw new Error(results[0]?.detail ?? status)
        }
        clearPendingImport()
        if (status === 'no-row') return
        addNotification({
          title: formatMessage({
            id: 'pdInterruptedTitle',
            defaultMessage: 'Import unterbrochen',
          }),
          body: formatMessage(
            {
              id: 'pdInterruptedBody',
              defaultMessage:
                'Der Import von "{name}" wurde durch das Schliessen oder Neuladen der App abgebrochen. Das unvollständige Projekt wurde wieder entfernt — bitte die Dumpdatei erneut importieren.',
            },
            { name: pending.projectName ?? '' },
          ),
          intent: 'warning',
          duration: 30000,
        })
      })
      .catch((error: unknown) => {
        // the marker stays: retried on the next start
        ran.current = false
        console.error('InterruptedImportCleanup:', error)
      })
  }, [
    addNotification,
    formatMessage,
    online,
    session?.user,
    sqlInitializing,
    syncObject,
  ])

  return null
}
