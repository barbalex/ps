import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoal } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, goal_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createGoal({ db, project_id, subproject_id })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.goal_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, subproject_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM goals WHERE goal_id = $1`, [goal_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, goal_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `Select goal_id from goals where subproject_id = $1 ORDER BY label`,
      [subproject_id],
    )
    const goals = res?.rows
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goal_id)
    const next = goals[(index + 1) % len]
    navigate({
      pathname: `../${next.goal_id}`,
      search: searchParams.toString(),
    })
  }, [db, subproject_id, navigate, searchParams, goal_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `Select goal_id from goals where subproject_id = $1 ORDER BY label`,
      [subproject_id],
    )
    const goals = res?.rows
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goal_id)
    const previous = goals[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.goal_id}`,
      search: searchParams.toString(),
    })
  }, [db, subproject_id, navigate, searchParams, goal_id])

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
