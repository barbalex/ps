import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createGoal } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from ===
    '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/goal'
  const { projectId, subprojectId, goalId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createGoal({ projectId, subprojectId })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/goal` : `../${id}/goal`,
      params: (prev) => ({ ...prev, goalId: id }),
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
      navigate({ to: isForm ? `../..` : `..` })
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
      const index = goals.findIndex((p) => p.goal_id === goalId)
      const next = goals[(index + 1) % len]
      navigate({
        to: isForm ? `../../${next.goal_id}/goal` : `../${next.goal_id}`,
        params: (prev) => ({ ...prev, goalId: next.goal_id }),
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
      const index = goals.findIndex((p) => p.goal_id === goalId)
      const previous = goals[(index + len - 1) % len]
      navigate({
        to: isForm ? `../../${previous.goal_id}/goal` : `../${previous.goal_id}`,
        params: (prev) => ({ ...prev, goalId: previous.goal_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

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
}
