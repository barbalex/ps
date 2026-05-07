import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ProjectExportForm } from './Form.tsx'
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

import type ProjectExports from '../../models/public/ProjectExports.ts'
import type ProjectExportsHistory from '../../models/public/ProjectExportsHistory.ts'

const from =
  '/data/projects/$projectId_/exports/$projectExportsId_/histories/$projectExportsHistoryId'

export const ProjectExportHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, projectExportsId, projectExportsHistoryId } = useParams({
    from,
    strict: false,
  })
  const projectExportPath = `/data/projects/${projectId}/exports/${projectExportsId}`
  const historyPath = `${projectExportPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState({})

  const rowRes = useLiveQuery(
    `SELECT * FROM project_exports WHERE project_exports_id = $1`,
    [projectExportsId],
  )
  const row = rowRes?.rows?.[0] as ProjectExports | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row?.[name] === value) return

    try {
      await db.query(
        `UPDATE project_exports SET ${name} = $1 WHERE project_exports_id = $2`,
        [value, projectExportsId],
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
      table: 'project_exports',
      rowIdName: 'project_exports_id',
      rowId: projectExportsId,
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
          id: 'exports.nameSingular',
          defaultMessage: 'Export',
        })}
        id={projectExportsId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <ProjectExportForm
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
    'level',
    'filter_by_year',
    'description',
    'sql',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name_de: { id: 'projectExport.nameDe', defaultMessage: 'Name (DE)' },
      name_en: { id: 'projectExport.nameEn', defaultMessage: 'Name (EN)' },
      name_fr: { id: 'projectExport.nameFr', defaultMessage: 'Name (FR)' },
      name_it: { id: 'projectExport.nameIt', defaultMessage: 'Name (IT)' },
      level: { id: 'projectExport.level', defaultMessage: 'Auf welcher Ebene wird exportiert?' },
      filter_by_year: { id: 'projectExport.filterByYear', defaultMessage: 'Nach Jahr filtern' },
      description: { id: 'projectExport.description', defaultMessage: 'Beschreibung' },
      sql: { id: 'projectExport.sql', defaultMessage: 'SQL' },
    },
  })

  const formatFieldValue = (field: string, history: ProjectExportsHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<ProjectExportsHistory>
      onBack={() => navigate({ to: projectExportPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'project_exports_history',
        rowIdField: 'project_exports_id',
        rowId: projectExportsId,
        historyPath,
        routeHistoryId: projectExportsHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'project_exports',
        rowIdName: 'project_exports_id',
        rowId: projectExportsId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
