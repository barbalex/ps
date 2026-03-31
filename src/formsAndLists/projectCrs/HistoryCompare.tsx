import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
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
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM project_crs WHERE project_crs_id = $1`,
    [projectCrsId],
  )
  const row = rowRes?.rows?.[0] as ProjectCrs | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE project_crs SET ${name} = $1 WHERE project_crs_id = $2`,
        [value, projectCrsId],
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
      const { [name]: _unused, ...rest } = prev
      return rest
    })

    addOperation({
      table: 'project_crs',
      rowIdName: 'project_crs_id',
      rowId: projectCrsId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

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
      <>
        <TextField
          label={formatMessage({ id: 'Fz4gCh', defaultMessage: 'Code' })}
          name="code"
          value={row.code ?? ''}
          onChange={onChange}
          validationState={validations?.code?.state}
          validationMessage={validations?.code?.message}
        />
        <TextField
          label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          validationState={validations?.name?.state}
          validationMessage={validations?.name?.message}
        />
        <TextArea
          label={formatMessage({ id: 'Gv5hDi', defaultMessage: 'Proj4-Wert' })}
          name="proj4"
          value={row.proj4 ?? ''}
          onChange={onChange}
          validationState={validations?.proj4?.state}
          validationMessage={validations?.proj4?.message}
        />
      </>
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
