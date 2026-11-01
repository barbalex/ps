import { useAtomValue, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import {
  userIdAtom,
  addNotificationAtom,
  chooseAccountForProjectAtom,
} from '../../store.ts'
import { backgroundTasks } from '../../modules/backgroundTasks.ts'
import {
  importProjectDump,
  parseProjectDump,
  ProjectDumpError,
  type ParsedDump,
} from '../../modules/projectDump/importProjectDump.ts'

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
              'Das Projekt "{name}" existiert bereits. Bitte zuerst löschen.',
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
      const result = await importProjectDump({
        db,
        dump,
        accountId,
        onProgress: ({ rows }) => backgroundTasks.updateProgress(taskId, rows),
      })
      backgroundTasks.complete(taskId)
      addNotification({
        title: formatMessage({
          id: 'pdImportDoneTitle',
          defaultMessage: 'Projekt importiert',
        }),
        body: formatMessage(
          {
            id: 'pdImportDoneBody',
            defaultMessage:
              '"{name}": {count} Zeilen an den Server übertragen. Die Daten werden nun synchronisiert.',
          },
          { name: result.projectName ?? '', count: result.rowCount },
        ),
        intent: 'success',
        duration: 15000,
      })
      navigate({
        to: '/data/projects/$projectId/project',
        params: { projectId: result.projectId },
      })
    } catch (error) {
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
