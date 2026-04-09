import { useState } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { createRootQcsAssignment } from '../modules/createRows.ts'
import { useRootQcsNavData } from '../modules/useRootQcsNavData.ts'
import { CheckboxField } from '../components/shared/CheckboxField.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom, languageAtom } from '../store.ts'
import styles from './rootQcs.module.css'

import '../form.css'

const { Button, Input, Field } = fluentUiReactComponents

type QcRow = {
  qcs_id: string
  name: string | null
  label: string | null
}

type ActiveEntry = {
  qcs_assignment_id: string
  qc_id: string
}

export const RootQcs = () => {
  const { navData } = useRootQcsNavData()
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const [searchTerm, setSearchTerm] = useState('')

  // Load all root-level QCS
  const qcsRes = useLiveQuery(
    `SELECT qcs_id, name, COALESCE(NULLIF(label_${language}, ''), label_de) AS label
     FROM qcs WHERE is_root_level = true ORDER BY label`,
  )

  // Load active assignments for root level (no project_id, no subproject_id)
  const activeRes = useLiveQuery(
    `SELECT qcs_assignment_id, qc_id FROM qcs_assignment
     WHERE project_id IS NULL AND subproject_id IS NULL`,
  )

  const loading = qcsRes === undefined || activeRes === undefined

  if (loading) return <Loading />

  const allQcs: QcRow[] = qcsRes?.rows ?? []
  const activeEntries: ActiveEntry[] = activeRes?.rows ?? []
  const activeQcIds = new Set(activeEntries.map((r) => r.qc_id))

  // Apply search filter
  const filteredQcs = searchTerm.trim()
    ? allQcs.filter((qc) => {
        const term = searchTerm.toLowerCase()
        return (
          (qc.label ?? '').toLowerCase().includes(term) ||
          (qc.name ?? '').toLowerCase().includes(term)
        )
      })
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
          },
        })
      } catch (error) {
        console.error('Error removing root QC:', error)
      }
    } else {
      await createRootQcsAssignment({ qcId })
    }
  }

  const activateAll = async () => {
    for (const qc of filteredQcs.filter((q) => !activeQcIds.has(q.qcs_id))) {
      await createRootQcsAssignment({ qcId: qc.qcs_id })
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
          },
        })
      } catch (error) {
        console.error('Error removing root QC:', error)
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
            id: 'rootQcs.filter',
            defaultMessage: 'Filtern',
          })}
        >
          <Input
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data.value)}
            placeholder={formatMessage({
              id: 'rootQcs.filterPlaceholder',
              defaultMessage: 'Name...',
            })}
            appearance="underline"
          />
        </Field>
        <Button appearance="subtle" onClick={activateAll}>
          {formatMessage({
            id: 'rootQcs.activateAll',
            defaultMessage: 'Alle aktivieren',
          })}
        </Button>
        <Button appearance="subtle" onClick={deactivateAll}>
          {formatMessage({
            id: 'rootQcs.deactivateAll',
            defaultMessage: 'Alle deaktivieren',
          })}
        </Button>
      </div>
      <div className="list-container">
        {filteredQcs.length === 0 ? (
          <div className={styles.empty}>
            {formatMessage({
              id: 'rootQcs.empty',
              defaultMessage: 'Keine Qualitätskontrollen vorhanden',
            })}
          </div>
        ) : (
          filteredQcs.map((qc) => (
            <CheckboxField
              key={qc.qcs_id}
              label={qc.label ?? qc.name ?? qc.qcs_id}
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
