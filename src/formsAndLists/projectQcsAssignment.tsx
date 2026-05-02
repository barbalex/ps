import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { createProjectQcsAssignment, createProjectQcsAssignmentForProjectQc } from '../modules/createRows.ts'
import { useProjectQcAssignmentsNavData } from '../modules/useProjectQcAssignmentsNavData.ts'
import { CheckboxField } from '../components/shared/CheckboxField.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom, languageAtom } from '../store.ts'
import styles from './projectQcsAssignment.module.css'

import '../form.css'

const { Button, Input, Field } = fluentUiReactComponents

type QcRow = {
  qcs_id: string
  label: string | null
}

type ActiveEntry = {
  qcs_assignment_id: string
  qc_id: string
}

type ProjectQcRow = {
  project_qc_id: string
  label: string | null
}

type ActiveProjectQcEntry = {
  project_qcs_assignment_id: string
  project_qc_id: string
}

type UnifiedQcItem = {
  id: string
  label: string | null
  source: 'qcs' | 'project_qcs'
}

export const ProjectQcs = ({ from }) => {
  const { projectId } = useParams({ from })
  const { navData } = useProjectQcAssignmentsNavData({ projectId })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const [searchTerm, setSearchTerm] = useState('')

  // Load all project-level QCS
  const qcsRes = useLiveQuery(
    `SELECT qcs_id, COALESCE(NULLIF(name_${language}, ''), name_de) AS label
     FROM qcs WHERE is_project_level = true ORDER BY label`,
  )

  // Load active assignments for this project
  const activeRes = useLiveQuery(
    `SELECT qcs_assignment_id, qc_id FROM qcs_assignment
     WHERE project_id = $1 AND subproject_id IS NULL`,
    [projectId],
  )

  // Load project-specific QCs for this project at project level
  const projectQcsRes = useLiveQuery(
    `SELECT project_qc_id, COALESCE(NULLIF(name_${language}, ''), name_de) AS label
     FROM project_qcs WHERE project_id = $1 AND is_project_level = true ORDER BY label`,
    [projectId],
  )

  // Load active project_qcs assignments for this project
  const activeProjectQcRes = useLiveQuery(
    `SELECT project_qcs_assignment_id, project_qc_id FROM project_qcs_assignment
     WHERE project_id = $1 AND subproject_id IS NULL`,
    [projectId],
  )

  const loading =
    qcsRes === undefined ||
    activeRes === undefined ||
    projectQcsRes === undefined ||
    activeProjectQcRes === undefined

  if (loading) return <Loading />

  const allQcs: QcRow[] = qcsRes?.rows ?? []
  const activeEntries: ActiveEntry[] = activeRes?.rows ?? []
  const activeQcIds = new Set(activeEntries.map((r) => r.qc_id))

  const allProjectQcs: ProjectQcRow[] = projectQcsRes?.rows ?? []
  const activeProjectQcEntries: ActiveProjectQcEntry[] = activeProjectQcRes?.rows ?? []
  const activeProjectQcIds = new Set(activeProjectQcEntries.map((r) => r.project_qc_id))

  // Merge both lists into a unified sorted list
  const allItems: UnifiedQcItem[] = [
    ...allQcs.map((qc) => ({ id: qc.qcs_id, label: qc.label, source: 'qcs' as const })),
    ...allProjectQcs.map((qc) => ({
      id: qc.project_qc_id,
      label: qc.label,
      source: 'project_qcs' as const,
    })),
  ].sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''))

  // Apply search filter
  const filteredItems = searchTerm.trim()
    ? allItems.filter((item) => (item.label ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    : allItems

  const isActive = (item: UnifiedQcItem) =>
    item.source === 'qcs' ? activeQcIds.has(item.id) : activeProjectQcIds.has(item.id)

  const toggle = async (item: UnifiedQcItem) => {
    if (item.source === 'qcs') {
      if (activeQcIds.has(item.id)) {
        const entry = activeEntries.find((e) => e.qc_id === item.id)
        if (!entry) return
        try {
          await db.query(
            `DELETE FROM qcs_assignment WHERE qcs_assignment_id = $1`,
            [entry.qcs_assignment_id],
          )
          addOperation({
            table: 'qcs_assignment',
            rowIdName: 'qcs_assignment_id',
            rowId: entry.qcs_assignment_id,
            operation: 'delete',
            prev: {
              qcs_assignment_id: entry.qcs_assignment_id,
              qc_id: item.id,
              project_id: projectId,
            },
          })
        } catch (error) {
          console.error('Error removing project QC:', error)
        }
      } else {
        await createProjectQcsAssignment({ projectId, qcId: item.id })
      }
    } else {
      if (activeProjectQcIds.has(item.id)) {
        const entry = activeProjectQcEntries.find((e) => e.project_qc_id === item.id)
        if (!entry) return
        try {
          await db.query(
            `DELETE FROM project_qcs_assignment WHERE project_qcs_assignment_id = $1`,
            [entry.project_qcs_assignment_id],
          )
          addOperation({
            table: 'project_qcs_assignment',
            rowIdName: 'project_qcs_assignment_id',
            rowId: entry.project_qcs_assignment_id,
            operation: 'delete',
            prev: {
              project_qcs_assignment_id: entry.project_qcs_assignment_id,
              project_qc_id: item.id,
              project_id: projectId,
            },
          })
        } catch (error) {
          console.error('Error removing project-specific QC:', error)
        }
      } else {
        await createProjectQcsAssignmentForProjectQc({ projectId, projectQcId: item.id })
      }
    }
  }

  const activateAll = async () => {
    for (const item of filteredItems.filter((i) => !isActive(i))) {
      if (item.source === 'qcs') {
        await createProjectQcsAssignment({ projectId, qcId: item.id })
      } else {
        await createProjectQcsAssignmentForProjectQc({ projectId, projectQcId: item.id })
      }
    }
  }

  const deactivateAll = async () => {
    for (const item of filteredItems.filter((i) => isActive(i))) {
      if (item.source === 'qcs') {
        const entry = activeEntries.find((e) => e.qc_id === item.id)
        if (!entry) continue
        try {
          await db.query(
            `DELETE FROM qcs_assignment WHERE qcs_assignment_id = $1`,
            [entry.qcs_assignment_id],
          )
          addOperation({
            table: 'qcs_assignment',
            rowIdName: 'qcs_assignment_id',
            rowId: entry.qcs_assignment_id,
            operation: 'delete',
            prev: {
              qcs_assignment_id: entry.qcs_assignment_id,
              qc_id: item.id,
              project_id: projectId,
            },
          })
        } catch (error) {
          console.error('Error removing project QC:', error)
        }
      } else {
        const entry = activeProjectQcEntries.find((e) => e.project_qc_id === item.id)
        if (!entry) continue
        try {
          await db.query(
            `DELETE FROM project_qcs_assignment WHERE project_qcs_assignment_id = $1`,
            [entry.project_qcs_assignment_id],
          )
          addOperation({
            table: 'project_qcs_assignment',
            rowIdName: 'project_qcs_assignment_id',
            rowId: entry.project_qcs_assignment_id,
            operation: 'delete',
            prev: {
              project_qcs_assignment_id: entry.project_qcs_assignment_id,
              project_qc_id: item.id,
              project_id: projectId,
            },
          })
        } catch (error) {
          console.error('Error removing project-specific QC:', error)
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
            id: 'projectQcs.filter',
            defaultMessage: 'Filtern',
          })}
        >
          <Input
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data.value)}
            placeholder={formatMessage({
              id: 'projectQcs.filterPlaceholder',
              defaultMessage: 'Name...',
            })}
            appearance="underline"
          />
        </Field>
        <Button appearance="subtle" onClick={activateAll}>
          {formatMessage({
            id: 'projectQcs.activateAll',
            defaultMessage: 'Alle aktivieren',
          })}
        </Button>
        <Button appearance="subtle" onClick={deactivateAll}>
          {formatMessage({
            id: 'projectQcs.deactivateAll',
            defaultMessage: 'Alle deaktivieren',
          })}
        </Button>
      </div>
      <div className="list-container">
        {filteredItems.length === 0 ? (
          <div className={styles.empty}>
            {formatMessage({
              id: 'projectQcs.empty',
              defaultMessage: 'Keine Qualitätskontrollen vorhanden',
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
