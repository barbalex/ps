import { useEffect, useRef } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  addNotificationAtom,
  initialSyncingAtom,
  sqlInitializingAtom,
  syncObjectAtom,
  updateNotificationAtom,
} from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'
import { useSession } from '../modules/authClient.ts'

export const Syncer = () => {
  const { formatMessage } = useIntl()
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const syncObject = useAtomValue(syncObjectAtom)
  const setSyncObject = useSetAtom(syncObjectAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const updateNotification = useSetAtom(updateNotificationAtom)
  const syncNotificationIdRef = useRef<string | null>(null)
  const { data: session, isPending } = useSession()
  const isAuthenticated = Boolean(session?.user)

  useEffect(() => {
    if (!isAuthenticated || sqlInitializing || !initialSyncing) return
    if (syncNotificationIdRef.current) return

    const id = addNotification({
      title: formatMessage({
        id: 'syncServerMsg',
        defaultMessage: 'Synchronisiere mit Server',
      }),
      body: formatMessage({
        id: 'syncServerTaskBody',
        defaultMessage: 'Initiale Synchronisation wird ausgefuehrt...',
      }),
      intent: 'info',
      paused: true,
      duration: 60000,
    }) as string

    syncNotificationIdRef.current = id
  }, [
    addNotification,
    formatMessage,
    initialSyncing,
    isAuthenticated,
    sqlInitializing,
  ])

  useEffect(() => {
    const id = syncNotificationIdRef.current
    if (!id) return
    if (isAuthenticated && initialSyncing) return

    updateNotification({
      id,
      draft: {
        intent: 'success',
        paused: false,
        body: formatMessage({
          id: 'syncServerTaskDone',
          defaultMessage: 'Synchronisation abgeschlossen.',
        }),
      },
    })
    syncNotificationIdRef.current = null
  }, [formatMessage, initialSyncing, isAuthenticated, updateNotification])

  // TODO: ensure syncing resumes after user has changed
  useEffect(() => {
    if (isPending) return
    if (!isAuthenticated) return
    if (sqlInitializing) return
    if (syncObject) {
      console.warn('Sync already initialized, skipping')
      return
    }

    startSyncing()
      .then((syncObj) => {
        console.log('Sync started')
        setSyncObject(syncObj)
      })
      .catch((error) => {
        console.error('Error starting sync:', error)
        const id = syncNotificationIdRef.current
        if (id) {
          updateNotification({
            id,
            draft: {
              intent: 'error',
              paused: false,
              body: formatMessage({
                id: 'syncServerTaskError',
                defaultMessage:
                  'Synchronisation konnte nicht gestartet werden. Bitte erneut anmelden.',
              }),
            },
          })
          syncNotificationIdRef.current = null
        }
      })
  }, [
    formatMessage,
    isAuthenticated,
    isPending,
    setSyncObject,
    sqlInitializing,
    syncObject,
    updateNotification,
  ])

  return null
}
