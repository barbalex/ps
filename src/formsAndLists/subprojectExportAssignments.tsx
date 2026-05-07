import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import {
  createSubprojectExportAssignment,
  createProjectExportAssignmentForProjectExport,
} from '../modules/createRows.ts'
import { useSubprojectExportAssignmentsNavData } from '../modules/useSubprojectExportAssignmentsNavData.ts'
import { CheckboxField } from '../components/shared/CheckboxField.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom, languageAtom } from '../store.ts'
import styles from './subprojectExportAssignments.module.css'

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

type ProjectExportRow = {
  project_exports_id: string
  label: string | null
}

type ActiveProjectExportEntry = {
  project_export_assignment_id: string
  project_exports_id: string
}

type UnifiedExportItem = {
  id: string
  label: string | null
  source: 'exports' | 'project_exports'
}

export const SubprojectExportAssignments = ({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const { navData } = useSubprojectExportAssignmentsNavData({
    projectId,
    subprojectId,
  })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const [searchTerm, setSearchTerm] = useState('')

  // Load all subproject-level exports that have SQL
  const exportsRes = useLiveQuery(
    `SELECT exports_id, COALESCE(NULLIF(name_${language}, ''), name_de) AS label
     FROM exports WHERE level = 'subproject' AND sql IS NOT NULL AND sql != '' ORDER BY label`,
  )

  // Load active export_assignments for this subproject
  const activeRes = useLiveQuery(
    `SELECT export_assignment_id, exports_id FROM export_assignments
     WHERE subproject_id = $1`,
    [subprojectId],
  )

  // Load project-specific exports for this project at subproject level that have SQL
  const projectExportsRes = useLiveQuery(
    `SELECT project_exports_id, COALESCE(NULLIF(name_${language}, ''), name_de) AS label
     FROM project_exports WHERE project_id = $1 AND level = 'subproject' AND sql IS NOT NULL AND sql != '' ORDER BY label`,
    [projectId],
  )

  // Load active project_export_assignments for this subproject
  const activeProjectExportRes = useLiveQuery(
    `SELECT project_export_assignment_id, project_exports_id FROM project_export_assignments
     WHERE subproject_id = $1`,
    [subprojectId],
  )

  const loading =
    exportsRes === undefined ||
    activeRes === undefined ||
    projectExportsRes === undefined ||
    activeProjectExportRes === undefined

  if (loading) return <Loading />

  const allExports: ExportRow[] = exportsRes?.rows ?? []
  const activeEntries: ActiveEntry[] = activeRes?.rows ?? []
  const activeExportsIds = new Set(activeEntries.map((r) => r.exports_id))

  const allProjectExports: ProjectExportRow[] = projectExportsRes?.rows ?? []
  const activeProjectExportEntries: ActiveProjectExportEntry[] =
    activeProjectExportRes?.rows ?? []
  const activeProjectExportsIds = new Set(
    activeProjectExportEntries.map((r) => r.project_exports_id),
  )

  const allItems: UnifiedExportItem[] = [
    ...allExports.map((e) => ({
      id: e.exports_id,
      label: e.label,
      source: 'exports' as const,
    })),
    ...allProjectExports.map((e) => ({
      id: e.project_exports_id,
      label: e.label,
      source: 'project_exports' as const,
    })),
  ].sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''))

  const filteredItems = searchTerm.trim()
    ? allItems.filter((item) =>
        (item.label ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : allItems

  const isActive = (item: UnifiedExportItem) =>
    item.source === 'exports'
      ? activeExportsIds.has(item.id)
      : activeProjectExportsIds.has(item.id)

  const toggle = async (item: UnifiedExportItem) => {
    if (item.source === 'exports') {
      if (activeExportsIds.has(item.id)) {
        const entry = activeEntries.find((e) => e.exports_id === item.id)
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
              exports_id: item.id,
              subproject_id: subprojectId,
            },
          })
        } catch (error) {
          console.error('Error removing subproject export:', error)
        }
      } else {
        await createSubprojectExportAssignment({
          subprojectId,
          exportsId: item.id,
        })
      }
    } else {
      if (activeProjectExportsIds.has(item.id)) {
        const entry = activeProjectExportEntries.find(
          (e) => e.project_exports_id === item.id,
        )
        if (!entry) return
        try {
          await db.query(
            `DELETE FROM project_export_assignments WHERE project_export_assignment_id = $1`,
            [entry.project_export_assignment_id],
          )
          addOperation({
            table: 'project_export_assignments',
            rowIdName: 'project_export_assignment_id',
            rowId: entry.project_export_assignment_id,
            operation: 'delete',
            prev: {
              project_export_assignment_id: entry.project_export_assignment_id,
              project_exports_id: item.id,
              subproject_id: subprojectId,
            },
          })
        } catch (error) {
          console.error('Error removing project-specific export:', error)
        }
      } else {
        await createProjectExportAssignmentForProjectExport({
          subprojectId,
          projectExportsId: item.id,
        })
      }
    }
  }

  const activateAll = async () => {
    for (const item of filteredItems.filter((i) => !isActive(i))) {
      if (item.source === 'exports') {
        await createSubprojectExportAssignment({
          subprojectId,
          exportsId: item.id,
        })
      } else {
        await createProjectExportAssignmentForProjectExport({
          subprojectId,
          projectExportsId: item.id,
        })
      }
    }
  }

  const deactivateAll = async () => {
    for (const item of filteredItems.filter((i) => isActive(i))) {
      if (item.source === 'exports') {
        const entry = activeEntries.find((e) => e.exports_id === item.id)
        if (!entry) continue
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
              exports_id: item.id,
              subproject_id: subprojectId,
            },
          })
        } catch (error) {
          console.error('Error removing subproject export:', error)
        }
      } else {
        const entry = activeProjectExportEntries.find(
          (e) => e.project_exports_id === item.id,
        )
        if (!entry) continue
        try {
          await db.query(
            `DELETE FROM project_export_assignments WHERE project_export_assignment_id = $1`,
            [entry.project_export_assignment_id],
          )
          addOperation({
            table: 'project_export_assignments',
            rowIdName: 'project_export_assignment_id',
            rowId: entry.project_export_assignment_id,
            operation: 'delete',
            prev: {
              project_export_assignment_id: entry.project_export_assignment_id,
              project_exports_id: item.id,
              subproject_id: subprojectId,
            },
          })
        } catch (error) {
          console.error('Error removing project-specific export:', error)
        }
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
            id: 'subprojectExports.filter',
            defaultMessage: 'Filtern',
          })}
        >
          <Input
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data.value)}
            placeholder={formatMessage({
              id: 'subprojectExports.filterPlaceholder',
              defaultMessage: 'Name...',
            })}
            appearance="underline"
          />
        </Field>
        <Button appearance="subtle" onClick={activateAll}>
          {formatMessage({
            id: 'subprojectExports.activateAll',
            defaultMessage: 'Alle aktivieren',
          })}
        </Button>
        <Button appearance="subtle" onClick={deactivateAll}>
          {formatMessage({
            id: 'subprojectExports.deactivateAll',
            defaultMessage: 'Alle deaktivieren',
          })}
        </Button>
      </div>
      <div className="list-container">
        {filteredItems.length === 0 ? (
          <div className={styles.empty}>
            {formatMessage({
              id: 'subprojectExports.empty',
              defaultMessage: 'Keine Exporte vorhanden',
            })}
          </div>
        ) : (
          filteredItems.map((item) => (
            <CheckboxField
              key={item.id}
              label={item.label ?? item.id}
              name={item.id}
              value={isActive(item)}
              onChange={() => toggle(item)}
            />
          ))
        )}
      </div>
    </div>
  )
}
