import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { GoalForm } from './Form.tsx'
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

import type GoalsHistory from '../../models/public/GoalsHistory.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/histories/$goalHistoryId'

export const GoalHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, subprojectId, goalId, goalHistoryId } = useParams({
    from,
    strict: false,
  })
  const goalBasePath = `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${goalId}`
  const historyPath = `${goalBasePath}/histories`
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(`SELECT * FROM goals WHERE goal_id = $1`, [goalId])
  const row = rowRes?.rows?.[0] as Record<string, unknown> | undefined

  const settingsRes = useLiveQuery(
    `SELECT p.goal_reports_in_goal
      FROM goals g
      INNER JOIN subprojects sp ON sp.subproject_id = g.subproject_id
      INNER JOIN projects p ON p.project_id = sp.project_id
      WHERE g.goal_id = $1`,
    [goalId],
  )
  const goalReportsInGoal = settingsRes?.rows?.[0]?.goal_reports_in_goal !== false
  const goalPath = goalReportsInGoal ? goalBasePath : `${goalBasePath}/goal`

  const visibleCurrentFields = new Set(['year', 'name', 'data'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      year: { id: 'bB4FgH', defaultMessage: 'Jahr' },
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      data: { id: 'bDbEhF', defaultMessage: 'Daten' },
    },
  })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(`UPDATE goals SET ${name} = $1 WHERE goal_id = $2`, [
        value,
        goalId,
      ])
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
      table: 'goals',
      rowIdName: 'goal_id',
      rowId: goalId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'Ikw+kl', defaultMessage: 'Ziel' })}
        id={goalId}
      />
    )
  }

  return (
    <HistoryCompare<GoalsHistory>
      onBack={() => navigate({ to: goalPath })}
      leftContent={
        <div className="form-container">
          <GoalForm
            row={row}
            onChange={onChange}
            validations={validations}
            autoFocusRef={autoFocusRef}
            from={from}
          />
        </div>
      }
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      row={row}
      historyConfig={{
        historyTable: 'goals_history',
        rowIdField: 'goal_id',
        rowId: goalId,
        historyPath,
        routeHistoryId: goalHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'goals',
        rowIdName: 'goal_id',
        rowId: goalId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
