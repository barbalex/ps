import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createGoal } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef }) => {
  const { projectId, subprojectId, goalId } = useParams({ strict: false })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current goalId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const goalIdRef = useRef(goalId)
  useEffect(() => {
    goalIdRef.current = goalId
  }, [goalId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM goals WHERE subproject_id = $1`,
    [subprojectId ?? null],
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2
  const settingsRes = useLiveQuery(
    `SELECT p.goal_reports_in_goal
      FROM goals g
      INNER JOIN subprojects sp ON sp.subproject_id = g.subproject_id
      INNER JOIN projects p ON p.project_id = sp.project_id
      WHERE g.goal_id = $1`,
    [goalId ?? null],
  )
  const goalReportsInGoal = settingsRes?.rows?.[0]?.goal_reports_in_goal !== false

  const addRow = async () => {
    const id = await createGoal({ projectId, subprojectId })
    if (!id) return
    navigate({
      to: goalReportsInGoal
        ? `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${id}`
        : `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${id}/goal`,
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(`SELECT * FROM goals WHERE goal_id = $1`, [
        goalId,
      ])
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM goals WHERE goal_id = $1`, [goalId])
      addOperation({
        table: 'goals',
        rowIdName: 'goal_id',
        rowId: goalId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `/data/projects/${projectId}/subprojects/${subprojectId}/goals` })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `Select goal_id from goals where subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const goals = res?.rows
      const len = goals.length
      const index = goals.findIndex((p) => p.goal_id === goalIdRef.current)
      const next = goals[(index + 1) % len]
      navigate({
        to: goalReportsInGoal
          ? `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${next.goal_id}`
          : `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${next.goal_id}/goal`,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `Select goal_id from goals where subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const goals = res?.rows
      const len = goals.length
      const index = goals.findIndex((p) => p.goal_id === goalIdRef.current)
      const previous = goals[(index + len - 1) % len]
      navigate({
        to: goalReportsInGoal
          ? `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${previous.goal_id}`
          : `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${previous.goal_id}/goal`,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'Ikw+kl', defaultMessage: 'Ziel' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="goal"
    />
  )
}
