import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { SubprojectForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type SubprojectsHistory from '../../models/public/SubprojectsHistory.ts'

export const SubprojectHistoryCompare = ({
  from,
}: {
  from: '/data/projects/$projectId_/subprojects/$subprojectId_/histories/$subprojectHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, subprojectId, subprojectHistoryId } = useParams({
    from,
    strict: false,
  })
  const subprojectPath = `/data/projects/${projectId}/subprojects/${subprojectId}/subproject`
  const historyPath = `/data/projects/${projectId}/subprojects/${subprojectId}/histories`
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM subprojects WHERE subproject_id = $1`,
    [subprojectId],
  )
  const row = rowRes?.rows?.[0] as Record<string, unknown> | undefined

  const visibleCurrentFields = new Set(['name', 'start_year'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      start_year: { id: 'bEkKpP', defaultMessage: 'Startjahr' },
      end_year: { id: 'bSubprojectEndYear', defaultMessage: 'Endjahr' },
    },
  })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE subprojects SET ${name} = $1 WHERE subproject_id = $2`,
        [value, subprojectId],
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
      table: 'subprojects',
      rowIdName: 'subproject_id',
      rowId: subprojectId,
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
          id: 'bSubproject',
          defaultMessage: 'Subproject',
        })}
        id={subprojectId}
      />
    )
  }

  return (
    <HistoryCompare<SubprojectsHistory>
      onBack={() => navigate({ to: subprojectPath })}
      leftContent={
        <SubprojectForm
          row={row}
          onChange={onChange}
          validations={validations}
          autoFocusRef={autoFocusRef}
          from={from}
        />
      }
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      row={row}
      historyConfig={{
        historyTable: 'subprojects_history',
        rowIdField: 'subproject_id',
        rowId: subprojectId,
        historyPath,
        routeHistoryId: subprojectHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'subprojects',
        rowIdName: 'subproject_id',
        rowId: subprojectId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
