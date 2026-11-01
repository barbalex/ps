import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip, Spinner } = fluentUiReactComponents
import { MdFileDownload } from 'react-icons/md'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { addNotificationAtom } from '../../store.ts'
import {
  buildProjectDump,
  saveProjectDump,
} from '../../modules/projectDump/exportProjectDump.ts'

type Props = { projectId: string }

export const ExportDumpButton = ({ projectId }: Props) => {
  const { formatMessage } = useIntl()
  const db = usePGlite()
  const addNotification = useSetAtom(addNotificationAtom)
  const [exporting, setExporting] = useState(false)

  const title = formatMessage({
    id: 'pdExportTitle',
    defaultMessage: 'In SQL-Dumpdatei exportieren',
  })

  const onClick = async () => {
    setExporting(true)
    try {
      const { parts, rowCount, tableCount, projectName } =
        await buildProjectDump(db, projectId)
      const saved = await saveProjectDump(parts, projectName)
      if (!saved) return
      addNotification({
        title,
        body: formatMessage(
          {
            id: 'pdExportDone',
            defaultMessage:
              '{count} Zeilen aus {tables} Tabellen exportiert (die lokal synchronisierten Daten).',
          },
          { count: rowCount, tables: tableCount },
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
    <Tooltip content={title} relationship="label">
      <Button
        size="medium"
        icon={exporting ? <Spinner size="tiny" /> : <MdFileDownload />}
        onClick={onClick}
        disabled={exporting}
      />
    </Tooltip>
  )
}
