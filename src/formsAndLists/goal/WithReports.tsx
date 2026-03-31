import { useRef, useState } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { createGoalReport } from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { GoalForm as Form } from './Form.tsx'
import { GoalReports } from '../goalReports.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { addOperationAtom } from '../../store.ts'
import type Goals from '../../models/public/Goals.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const GoalWithReports = ({ from }) => {
  const { projectId, subprojectId, goalId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM goals WHERE goal_id = $1`, [goalId])
  const row: Goals | undefined = res?.rows?.[0]

  const settingsRes = useLiveQuery(
    `SELECT p.goal_reports_in_goal
      FROM goals g
      INNER JOIN subprojects sp ON sp.subproject_id = g.subproject_id
      INNER JOIN projects p ON p.project_id = sp.project_id
      WHERE g.goal_id = $1`,
    [goalId],
  )
  const goalReportsInGoal = settingsRes?.rows?.[0]?.goal_reports_in_goal !== false

  const reportsCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM goal_reports WHERE goal_id = $1`,
    [goalId],
  )
  const reportsCount = reportsCountRes?.rows?.[0]?.count ?? 0

  const goalBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${goalId}`
  const goalUrl = goalBaseUrl
  const reportsUrl = `${goalBaseUrl}/reports`

  const isReportsOpen =
    location.pathname.endsWith('/reports') ||
    location.pathname.includes('/reports/')
  const isReportsList = /\/reports\/?$/.test(location.pathname)

  const onClickAddGoalReport = async () => {
    const id = await createGoalReport({ projectId, goalId })
    if (!id) return
    navigate({ to: `${reportsUrl}/${id}/` })
  }

  const reportHeaderActions =
    goalReportsInGoal && isReportsList ? (
      <Button
        size="medium"
        title={formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })}
        icon={<FaPlus />}
        onClick={onClickAddGoalReport}
      />
    ) : undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return

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
      const { [name]: _, ...rest } = prev
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

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Goal" id={goalId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          from={from}
          validations={validations}
        />
        {goalReportsInGoal ? (
          <Section
            title={`${formatMessage({ id: 'SmwFfB', defaultMessage: 'Ziel-Berichte' })} (${reportsCount})`}
            parentUrl={goalUrl}
            listUrl={reportsUrl}
            isOpen={isReportsOpen}
            titleStyle={{ marginBottom: 0 }}
            childrenStyle={{ marginLeft: -10, marginRight: -10 }}
            headerActions={reportHeaderActions}
          >
            {isReportsOpen &&
              (isReportsList ? <GoalReports hideHeader /> : <Outlet />)}
          </Section>
        ) : (
          isReportsOpen && <Outlet />
        )}
      </div>
    </div>
  )
}
