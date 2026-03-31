import { useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ProjectCrsForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type ProjectCrs from '../../models/public/ProjectCrs.ts'
import type ProjectCrsHistory from '../../models/public/ProjectCrsHistory.ts'

const from =
  '/data/projects/$projectId_/crs/$projectCrsId_/histories/$projectCrsHistoryId'

export const ProjectCrsHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, projectCrsId, projectCrsHistoryId } = useParams({
    from,
    strict: false,
  })
  const projectCrsPath = `/data/projects/${projectId}/crs/${projectCrsId}`
  const historyPath = `${projectCrsPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const rowRes = useLiveQuery(
    `SELECT * FROM project_crs WHERE project_crs_id = $1`,
    [projectCrsId],
  )
  const row = rowRes?.rows?.[0] as ProjectCrs | undefined

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'OzBS9Z', defaultMessage: 'KBS' })}
        id={projectCrsId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <ProjectCrsForm autoFocusRef={autoFocusRef} />
    </div>
  )

  const visibleCurrentFields = new Set(['code', 'name', 'proj4'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      code: { id: 'Fz4gCh', defaultMessage: 'Code' },
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      proj4: { id: 'Gv5hDi', defaultMessage: 'Proj4-Wert' },
    },
  })

  const formatFieldValue = (field: string, history: ProjectCrsHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<ProjectCrsHistory>
      onBack={() => navigate({ to: projectCrsPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'project_crs_history',
        rowIdField: 'project_crs_id',
        rowId: projectCrsId,
        historyPath,
        routeHistoryId: projectCrsHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'project_crs',
        rowIdName: 'project_crs_id',
        rowId: projectCrsId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
