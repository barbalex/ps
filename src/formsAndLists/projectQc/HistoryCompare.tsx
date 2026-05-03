import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ProjectQcForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type ProjectQcs from '../../models/public/ProjectQcs.ts'
import type ProjectQcsHistory from '../../models/public/ProjectQcsHistory.ts'

const from =
  '/data/projects/$projectId_/qcs/$projectQcId_/histories/$projectQcHistoryId'

export const ProjectQcHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, projectQcId, projectQcHistoryId } = useParams({
    from,
    strict: false,
  })
  const projectQcPath = `/data/projects/${projectId}/qcs/${projectQcId}`
  const historyPath = `${projectQcPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState({})

  const rowRes = useLiveQuery(
    `SELECT * FROM project_qcs WHERE project_qc_id = $1`,
    [projectQcId],
  )
  const row = rowRes?.rows?.[0] as ProjectQcs | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row?.[name] === value) return

    try {
      await db.query(
        `UPDATE project_qcs SET ${name} = $1 WHERE project_qc_id = $2`,
        [value, projectQcId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'project_qcs',
      rowIdName: 'project_qc_id',
      rowId: projectQcId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({
          id: 'qcs.nameSingular',
          defaultMessage: 'Qualitätskontrolle',
        })}
        id={projectQcId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <ProjectQcForm
        onChange={onChange}
        validations={validations}
        row={row}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )

  const visibleCurrentFields = new Set([
    'name_de',
    'name_en',
    'name_fr',
    'name_it',
    'description',
    'is_project_level',
    'is_subproject_level',
    'filter_by_year',
    'sql',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name_de: { id: 'qc.nameDe', defaultMessage: 'Name (DE)' },
      name_en: { id: 'qc.nameEn', defaultMessage: 'Name (EN)' },
      name_fr: { id: 'qc.nameFr', defaultMessage: 'Name (FR)' },
      name_it: { id: 'qc.nameIt', defaultMessage: 'Name (IT)' },
      description: { id: 'v6Yf4v', defaultMessage: 'Beschreibung' },
      is_project_level: {
        id: 'qc.isProjectLevel',
        defaultMessage: 'Projekt-Ebene',
      },
      is_subproject_level: {
        id: 'qc.isSubprojectLevel',
        defaultMessage: 'Teilprojekt-Ebene',
      },
      filter_by_year: {
        id: 'qc.filterByYear',
        defaultMessage: 'Nach Jahr filtern',
      },
      sql: { id: 'qc.sql', defaultMessage: 'SQL' },
    },
  })

  const formatFieldValue = (field: string, history: ProjectQcsHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<ProjectQcsHistory>
      onBack={() => navigate({ to: projectQcPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'project_qcs_history',
        rowIdField: 'project_qc_id',
        rowId: projectQcId,
        historyPath,
        routeHistoryId: projectQcHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'project_qcs',
        rowIdName: 'project_qc_id',
        rowId: projectQcId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
