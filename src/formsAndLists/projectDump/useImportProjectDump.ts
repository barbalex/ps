import { useAtomValue, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import {
  userIdAtom,
  addNotificationAtom,
  chooseAccountForProjectAtom,
  operationsQueueAtom,
  store,
  syncPausedAtom,
} from '../../store.ts'
import { backgroundTasks } from '../../modules/backgroundTasks.ts'
import {
  countArrivedRows,
  importedRowCount,
  importProjectDump,
  parseProjectDump,
  ProjectDumpError,
  type ParsedDump,
} from '../../modules/projectDump/importProjectDump.ts'
import { notifyAllLiveTables } from '../../modules/gateLiveNotifyTriggers.ts'

// the arrival poll gives up after this long (shape dropped by Electric,
// rows out of scope, …) and reports what came
const ARRIVAL_TIMEOUT_MS = 60 * 60_000
const ARRIVAL_POLL_MS = 3_000

/**
 * Returns a callback importing a project dump file: resolves the account
 * the project goes into (same flow as useAddProject: none → hint, one →
 * direct, several → chooser dialog), uploads the dump with a progress task
 * and navigates to the project when the server has it.
 */
export const useImportProjectDump = () => {
  const { formatMessage } = useIntl()
  const db = usePGlite()
  const navigate = useNavigate()
  const userId = useAtomValue(userIdAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const setChooseAccount = useSetAtom(chooseAccountForProjectAtom)
  const setSyncPaused = useSetAtom(syncPausedAtom)

  const fail = (error: unknown) => {
    const dumpError = error instanceof ProjectDumpError ? error : null
    const name = dumpError?.projectName ?? ''
    const body =
      dumpError?.reason === 'invalid' ?
        formatMessage({
          id: 'pdImportInvalid',
          defaultMessage: 'Die Datei ist kein Projekt-Dump dieser App.',
        })
      : dumpError?.reason === 'exists' ?
        formatMessage(
          {
            id: 'pdImportExists',
            defaultMessage:
              'Das Projekt "{name}" existiert bereits (lokal oder auf dem Server). Bitte zuerst löschen und warten, bis die Löschung synchronisiert ist.',
          },
          { name },
        )
      : dumpError?.reason === 'offline' ?
        formatMessage({
          id: 'pdImportOffline',
          defaultMessage: 'Der Import benötigt eine Verbindung zum Server.',
        })
      : (error as Error).message
    addNotification({
      title: formatMessage({
        id: 'pdImportError',
        defaultMessage: 'Import fehlgeschlagen',
      }),
      body,
      intent: 'error',
      duration: 15000,
    })
  }

  // Second phase, shown as its own task: the server streams the project
  // back over minutes (Electric evaluates each row against every subquery
  // shape). Polls the local row count of the project until all uploaded
  // rows are there, then kicks the live queries so the UI shows them.
  const trackArrival = async (dump: ParsedDump) => {
    const total = importedRowCount(dump)
    const taskId = `import-project-arrival-${dump.projectId}`
    backgroundTasks.add(
      taskId,
      formatMessage(
        { id: 'pdArrivalTask', defaultMessage: 'Empfange Projekt {name}' },
        { name: dump.projectName ?? '' },
      ),
      total,
    )
    const startedAt = Date.now()
    let arrived = 0
    while (arrived < total && Date.now() - startedAt < ARRIVAL_TIMEOUT_MS) {
      await new Promise((r) => setTimeout(r, ARRIVAL_POLL_MS))
      try {
        arrived = await countArrivedRows(db, dump)
      } catch {
        // a query lost to a busy worker: the next poll retries
      }
      backgroundTasks.updateProgress(taskId, Math.min(arrived, total))
    }
    if (arrived >= total) {
      backgroundTasks.complete(taskId)
      void notifyAllLiveTables(db).catch(() => undefined)
      addNotification({
        title: formatMessage({
          id: 'pdArrivalDoneTitle',
          defaultMessage: 'Projekt synchronisiert',
        }),
        body: formatMessage(
          {
            id: 'pdArrivalDoneBody',
            defaultMessage: '"{name}" ist jetzt vollständig verfügbar.',
          },
          { name: dump.projectName ?? '' },
        ),
        intent: 'success',
        duration: 10000,
      })
    } else {
      backgroundTasks.error(
        taskId,
        formatMessage(
          {
            id: 'pdArrivalIncomplete',
            defaultMessage:
              'Nach einer Stunde sind {arrived} von {total} Zeilen angekommen. Die Synchronisation läuft weiter.',
          },
          { arrived, total },
        ),
      )
    }
  }

  const runImport = async (dump: ParsedDump, accountId: string) => {
    const taskId = `import-project-dump-${dump.projectId}`
    backgroundTasks.add(
      taskId,
      formatMessage(
        { id: 'pdImportTask', defaultMessage: 'Importiere Projekt {name}' },
        { name: dump.projectName ?? '' },
      ),
      dump.statements.reduce((sum, s) => sum + s.rows.length, 0),
    )
    try {
      // local edits still queued (typically the delete of the project being
      // re-imported) must reach the server first, else the insert collides
      const queueStart = Date.now()
      while (
        store.get(operationsQueueAtom).length &&
        Date.now() - queueStart < 120_000
      ) {
        await new Promise((r) => setTimeout(r, 500))
      }
      // the upload is a flood of inserts across every FK level; streamed
      // back live they would arrive child-before-parent (see syncPausedAtom).
      // Paused, the staged restart afterwards catches up in FK order
      setSyncPaused(true)
      const result = await importProjectDump({
        db,
        dump,
        accountId,
        onProgress: ({ rows }) => backgroundTasks.updateProgress(taskId, rows),
      })
      setSyncPaused(false)
      backgroundTasks.complete(taskId)
      addNotification({
        title: formatMessage({
          id: 'pdImportDoneTitle',
          defaultMessage: 'Projekt hochgeladen',
        }),
        body: formatMessage(
          {
            id: 'pdImportDoneBody',
            defaultMessage:
              '"{name}": {count} Zeilen an den Server übertragen. Der Server bereitet die Daten nun für die Synchronisation vor — der Fortschritt wird unten rechts angezeigt.',
          },
          { name: result.projectName ?? '', count: result.rowCount },
        ),
        intent: 'success',
        duration: 15000,
      })
      // the project arrives with the restarted sync; its form would be
      // empty until then, so stay on the list
      navigate({ to: '/data/projects' })
      void trackArrival(dump)
    } catch (error) {
      setSyncPaused(false)
      backgroundTasks.error(taskId, (error as Error).message)
      fail(error)
    }
  }

  const importFile = async (file: File) => {
    let dump: ParsedDump
    try {
      dump = parseProjectDump(await file.text())
    } catch (error) {
      fail(error)
      return
    }

    const accountsRes = await db.query<{
      account_id: string
      label: string | null
    }>(
      `SELECT account_id, label FROM accounts WHERE user_id = $1 ORDER BY label`,
      [userId],
    )
    const accounts = accountsRes?.rows ?? []

    if (accounts.length === 0) {
      addNotification({
        title: formatMessage({
          id: 'noAccountTitle',
          defaultMessage: 'Kein Konto vorhanden',
        }),
        body: formatMessage({
          id: 'noAccountBody',
          defaultMessage:
            'Um Projekte zu erstellen, bitte zuerst ein Konto anlegen.',
        }),
        intent: 'warning',
      })
      navigate({ to: `/data/users/${userId}/accounts/` })
      return
    }

    if (accounts.length === 1) {
      await runImport(dump, accounts[0]!.account_id)
      return
    }

    setChooseAccount({
      accounts,
      onAccountSelected: (account_id) => void runImport(dump, account_id),
    })
  }

  return importFile
}
