import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoal } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef, from }) => {
  const { projectId, subprojectId, goalId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createGoal({ db, projectId, subprojectId })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.goal_id}`,
      params: (prev) => ({ ...prev, goalId: data.goal_id }),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, projectId, subprojectId])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM goals WHERE goal_id = $1`, [goalId])
    navigate({ to: '..' })
  }, [db, goalId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `Select goal_id from goals where subproject_id = $1 ORDER BY label`,
      [subprojectId],
    )
    const goals = res?.rows
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goalId)
    const next = goals[(index + 1) % len]
    navigate({
      to: `../${next.goal_id}`,
      params: (prev) => ({ ...prev, goalId: next.goal_id }),
    })
  }, [db, subprojectId, navigate, goalId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `Select goal_id from goals where subproject_id = $1 ORDER BY label`,
      [subprojectId],
    )
    const goals = res?.rows
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goalId)
    const previous = goals[(index + len - 1) % len]
    navigate({
      to: `../${previous.goal_id}`,
      params: (prev) => ({ ...prev, goalId: previous.goal_id }),
    })
  }, [db, subprojectId, navigate, goalId])

  return (
    <FormHeader
      title="Goal"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal"
    />
  )
})
