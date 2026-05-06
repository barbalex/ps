import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import {
  createProjectExportAssignment,
  createProjectExportAssignmentForProjectExport,
} from '../modules/createRows.ts'
import { useProjectExportAssignmentsNavData } from '../modules/useProjectExportAssignmentsNavData.ts'
import { CheckboxField } from '../components/shared/CheckboxField.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom, languageAtom } from '../store.ts'
import styles from './projectExportAssignments.module.css'

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

export const ProjectExportAssignments = ({ from }) => {
  const { projectId } = useParams({ from })
  const { navData } = useProjectExportAssignmentsNavData({ projectId })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const [searchTerm, setSearchTerm] = useState('')

  // Load all project-level exports that have SQL
  const exportsRes = useLiveQuery(
    `SELECT exports_id, COALESCE(NULLIF(name_${language}, ''), name_de) AS label
     FROM exports WHERE level = 'project' AND sql IS NOT NULL AND sql != '' ORDER BY label`,
  )

  // Load active assignments for this project
  const activeRes = useLiveQuery(
    `SELECT export_assignment_id, exports_id FROM export_assignments
     WHERE project_id = $1 AND subproject_id IS NULL`,
    [projectId],
  )

  // Load project-specific exports for this project at project level that have SQL
  const projectExportsRes = useLiveQuery(
    `SELECT project_exports_id, COALESCE(NULLIF(name_${language}, ''), name_de) AS label
     FROM project_exports WHERE project_id = $1 AND level = 'project' AND sql IS NOT NULL AND sql != '' ORDER BY label`,
    [projectId],
  )

  // Load active project_exports assignments for this project
  const activeProjectExportRes = useLiveQuery(
    `SELECT project_export_assignment_id, project_exports_id FROM project_export_assignments
     WHERE project_id = $1 AND subproject_id IS NULL`,
    [projectId],
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

  // Merge both lists into a unified sorted list
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
              project_id: projectId,
            },
          })
        } catch (error) {
          console.error('Error removing project export:', error)
        }
      } else {
        await createProjectExportAssignment({ projectId, exportsId: item.id })
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
              project_id: projectId,
            },
          })
        } catch (error) {
          console.error('Error removing project-specific export:', error)
        }
      } else {
        await createProjectExportAssignmentForProjectExport({
          projectId,
          projectExportsId: item.id,
        })
      }
    }
  }

  const activateAll = async () => {
    for (const item of filteredItems.filter((i) => !isActive(i))) {
      if (item.source === 'exports') {
        await createProjectExportAssignment({ projectId, exportsId: item.id })
      } else {
        await createProjectExportAssignmentForProjectExport({
          projectId,
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
              project_id: projectId,
            },
          })
        } catch (error) {
          console.error('Error removing project export:', error)
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
              project_id: projectId,
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
            id: 'projectExports.filter',
            defaultMessage: 'Filtern',
          })}
        >
          <Input
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data.value)}
            placeholder={formatMessage({
              id: 'projectExports.filterPlaceholder',
              defaultMessage: 'Name...',
            })}
            appearance="underline"
          />
        </Field>
        <Button appearance="subtle" onClick={activateAll}>
          {formatMessage({
            id: 'projectExports.activateAll',
            defaultMessage: 'Alle aktivieren',
          })}
        </Button>
        <Button appearance="subtle" onClick={deactivateAll}>
          {formatMessage({
            id: 'projectExports.deactivateAll',
            defaultMessage: 'Alle deaktivieren',
          })}
        </Button>
      </div>
      <div className="list-container">
        {filteredItems.length === 0 ? (
          <div className={styles.empty}>
            {formatMessage({
              id: 'projectExports.empty',
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
