import { useState } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { createRootExportAssignment } from '../modules/createRows.ts'
import { useRootExportsNavData } from '../modules/useRootExportsNavData.ts'
import { CheckboxField } from '../components/shared/CheckboxField.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom, languageAtom } from '../store.ts'
import styles from './rootExports.module.css'

import '../form.css'

const { Button, Input, Field } = fluentUiReactComponents

type ExportRow = {
  exports_id: string
  label: string | null
}

type ActiveEntry = {
  export_assignment_id: string
  exports_id: string
}

export const RootExports = () => {
  const { navData } = useRootExportsNavData()
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const [searchTerm, setSearchTerm] = useState('')

  // Load all root-level exports
  const exportsRes = useLiveQuery(
    `SELECT exports_id, COALESCE(NULLIF(name_${language}, ''), name_de) AS label
     FROM exports WHERE level = 'root' ORDER BY label`,
  )

  // Load active assignments for root level (no project_id, no subproject_id)
  const activeRes = useLiveQuery(
    `SELECT export_assignment_id, exports_id FROM export_assignments
     WHERE project_id IS NULL AND subproject_id IS NULL`,
  )

  const loading = exportsRes === undefined || activeRes === undefined

  if (loading) return <Loading />

  const allExports: ExportRow[] = exportsRes?.rows ?? []
  const activeEntries: ActiveEntry[] = activeRes?.rows ?? []
  const activeExportsIds = new Set(activeEntries.map((r) => r.exports_id))

  const filteredExports = searchTerm.trim()
    ? allExports.filter((e) =>
        (e.label ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : allExports

  const toggle = async (exportsId: string) => {
    if (activeExportsIds.has(exportsId)) {
      const entry = activeEntries.find((e) => e.exports_id === exportsId)
      if (!entry) return
      try {
        await db.query(
          `DELETE FROM export_assignments WHERE export_assignment_id = $1`,
          [entry.export_assignment_id],
        )
        addOperation({
          table: 'export_assignments',
          rowIdName: 'export_assignment_id',
          rowId: entry.export_assignment_id,
          operation: 'delete',
          prev: {
            export_assignment_id: entry.export_assignment_id,
            exports_id: exportsId,
          },
        })
      } catch (error) {
        console.error('Error removing root export:', error)
      }
    } else {
      await createRootExportAssignment({ exportsId })
    }
  }

  const activateAll = async () => {
    for (const e of filteredExports.filter(
      (x) => !activeExportsIds.has(x.exports_id),
    )) {
      await createRootExportAssignment({ exportsId: e.exports_id })
    }
  }

  const deactivateAll = async () => {
    for (const entry of activeEntries.filter((e) =>
      filteredExports.some((x) => x.exports_id === e.exports_id),
    )) {
      try {
        await db.query(
          `DELETE FROM export_assignments WHERE export_assignment_id = $1`,
          [entry.export_assignment_id],
        )
        addOperation({
          table: 'export_assignments',
          rowIdName: 'export_assignment_id',
          rowId: entry.export_assignment_id,
          operation: 'delete',
          prev: {
            export_assignment_id: entry.export_assignment_id,
            exports_id: entry.exports_id,
          },
        })
      } catch (error) {
        console.error('Error removing root export:', error)
      }
    }
  }

  return (
    <div className="list-view">
      <div className="list-view-header">
        <h1>{navData.label}</h1>
      </div>
      <div className={styles.filters}>
        <Field
          label={formatMessage({
            id: 'rootExports.filter',
            defaultMessage: 'Filtern',
          })}
        >
          <Input
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data.value)}
            placeholder={formatMessage({
              id: 'rootExports.filterPlaceholder',
              defaultMessage: 'Name...',
            })}
            appearance="underline"
          />
        </Field>
        <Button appearance="subtle" onClick={activateAll}>
          {formatMessage({
            id: 'rootExports.activateAll',
            defaultMessage: 'Alle aktivieren',
          })}
        </Button>
        <Button appearance="subtle" onClick={deactivateAll}>
          {formatMessage({
            id: 'rootExports.deactivateAll',
            defaultMessage: 'Alle deaktivieren',
          })}
        </Button>
      </div>
      <div className="list-container">
        {filteredExports.length === 0 ? (
          <div className={styles.empty}>
            {formatMessage({
              id: 'rootExports.empty',
              defaultMessage: 'Keine Exporte vorhanden',
            })}
          </div>
        ) : (
          filteredExports.map((e) => (
            <CheckboxField
              key={e.exports_id}
              label={e.label ?? e.exports_id}
              name={e.exports_id}
              value={activeExportsIds.has(e.exports_id)}
              onChange={() => toggle(e.exports_id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
