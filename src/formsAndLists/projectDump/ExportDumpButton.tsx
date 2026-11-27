import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, Spinner } =
  fluentUiReactComponents
import { MdFileDownload } from 'react-icons/md'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import { saveAs } from 'file-saver'

import { addNotificationAtom } from '../../store.ts'
import {
  buildProjectDump,
  safeFileName,
  saveProjectDump,
} from '../../modules/projectDump/exportProjectDump.ts'

type Props = { projectId: string }

export const ExportDumpButton = ({ projectId }: Props) => {
  const { formatMessage } = useIntl()
  const db = usePGlite()
  const addNotification = useSetAtom(addNotificationAtom)
  const [exporting, setExporting] = useState(false)

  const sqlTitle = formatMessage({
    id: 'pdExportTitle',
    defaultMessage: 'In SQL-Dumpdatei exportieren',
  })

  const title = formatMessage({
    id: 'pdFormatMenu',
    defaultMessage: 'Projekt exportieren',
  })
  const onClick = async (format: 'sql' | 'sqlite') => {
    setExporting(true)
    try {
      let result: { rowCount: number; tableCount: number }
      if (format === 'sqlite') {
        const { buildProjectSqlite } =
          await import('../../modules/projectDump/exportProjectSqlite.ts')
        const snapshot = await buildProjectSqlite(db, projectId)
        saveAs(
          snapshot.blob,
          `${safeFileName(snapshot.projectName ?? 'project')}_${new Date().toISOString().slice(0, 10)}.sqlite`,
        )
        if (snapshot.missingReferences)
          addNotification({
            intent: 'warning',
            title,
            body: formatMessage(
              {
                id: 'pdMissingReferences',
                defaultMessage:
                  '{count} Verweise zeigen auf Datensätze ausserhalb dieses lokalen SQLite-Exports.',
              },
              { count: snapshot.missingReferences },
            ),
          })
        result = snapshot
      } else {
        const dump = await buildProjectDump(db, projectId)
        if (!(await saveProjectDump(dump.parts, dump.projectName))) return
        result = dump
      }
      addNotification({
        title,
        body: formatMessage(
          {
            id: 'pdExportDone',
            defaultMessage:
              '{count} Zeilen aus {tables} Tabellen exportiert (die lokal synchronisierten Daten).',
          },
          { count: result.rowCount, tables: result.tableCount },
        ),
        intent: 'success',
        duration: 10000,
      })
    } catch (error) {
      console.error('ExportDumpButton:', error)
      addNotification({
        title: formatMessage({
          id: 'pdExportError',
          defaultMessage: 'Export fehlgeschlagen',
        }),
        body: (error as Error).message,
        intent: 'error',
        duration: 15000,
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          aria-label={title}
          title={title}
          size="medium"
          icon={exporting ? <Spinner size="tiny" /> : <MdFileDownload />}
          disabled={exporting}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem onClick={() => void onClick('sql')}>{sqlTitle}</MenuItem>
          <MenuItem onClick={() => void onClick('sqlite')}>
            SQLite (.sqlite)
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
