import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { createSubprojectQc } from '../modules/createRows.ts'
import { useSubprojectQcAssignmentsNavData } from '../modules/useSubprojectQcAssignmentsNavData.ts'
import { CheckboxField } from '../components/shared/CheckboxField.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom, languageAtom } from '../store.ts'
import styles from './subprojectQcsAssignment.module.css'

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

export const SubprojectQcs = ({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const { navData } = useSubprojectQcAssignmentsNavData({ projectId, subprojectId })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const [searchTerm, setSearchTerm] = useState('')

  // Load all qcs with subproject level
  const qcsRes = useLiveQuery(
    `SELECT qcs_id, COALESCE(NULLIF(label_${language}, ''), label_de) AS label
     FROM qcs WHERE is_subproject_level = true ORDER BY label`,
  )

  // Load active qcs_assignment for this subproject
  const activeRes = useLiveQuery(
    `SELECT qcs_assignment_id, qc_id FROM qcs_assignment WHERE subproject_id = $1`,
    [subprojectId],
  )

  const loading = qcsRes === undefined || activeRes === undefined

  if (loading) return <Loading />

  const allQcs: QcRow[] = qcsRes?.rows ?? []
  const activeEntries: ActiveEntry[] = activeRes?.rows ?? []
  const activeQcIds = new Set(activeEntries.map((r) => r.qc_id))

  // Apply search filter
  const filteredQcs = searchTerm.trim()
    ? allQcs.filter((qc) => (qc.label ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    : allQcs

  const toggle = async (qcId: string) => {
    if (activeQcIds.has(qcId)) {
      const entry = activeEntries.find((e) => e.qc_id === qcId)
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
            qc_id: qcId,
            subproject_id: subprojectId,
          },
        })
      } catch (error) {
        console.error('Error removing subproject QC:', error)
      }
    } else {
      await createSubprojectQc({ subprojectId, qcId })
    }
  }

  const activateAll = async () => {
    for (const qc of filteredQcs.filter((q) => !activeQcIds.has(q.qcs_id))) {
      await createSubprojectQc({ subprojectId, qcId: qc.qcs_id })
    }
  }

  const deactivateAll = async () => {
    for (const entry of activeEntries.filter((e) =>
      filteredQcs.some((qc) => qc.qcs_id === e.qc_id),
    )) {
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
            qc_id: entry.qc_id,
            subproject_id: subprojectId,
          },
        })
      } catch (error) {
        console.error('Error removing subproject QC:', error)
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
            id: 'subprojectQcs.filter',
            defaultMessage: 'Filtern',
          })}
        >
          <Input
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data.value)}
            placeholder={formatMessage({
              id: 'subprojectQcs.filterPlaceholder',
              defaultMessage: 'Name...',
            })}
            appearance="underline"
          />
        </Field>
        <Button appearance="subtle" onClick={activateAll}>
          {formatMessage({
            id: 'subprojectQcs.activateAll',
            defaultMessage: 'Alle aktivieren',
          })}
        </Button>
        <Button appearance="subtle" onClick={deactivateAll}>
          {formatMessage({
            id: 'subprojectQcs.deactivateAll',
            defaultMessage: 'Alle deaktivieren',
          })}
        </Button>
      </div>
      <div className="list-container">
        {filteredQcs.length === 0 ? (
          <div className={styles.empty}>
            {formatMessage({
              id: 'subprojectQcs.empty',
              defaultMessage: 'Keine Qualitätskontrollen vorhanden',
            })}
          </div>
        ) : (
          filteredQcs.map((qc) => (
            <CheckboxField
              key={qc.qcs_id}
              label={qc.label ?? qc.qcs_id}
              name={qc.qcs_id}
              value={activeQcIds.has(qc.qcs_id)}
              onChange={() => toggle(qc.qcs_id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
