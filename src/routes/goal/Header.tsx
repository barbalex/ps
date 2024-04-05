import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createGoal } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, goal_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createGoal({ db, project_id, subproject_id })
    await db.goals.create({ data })
    navigate({
      pathname: `../${data.goal_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, subproject_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.goals.delete({ where: { goal_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.goals, goal_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const goals = await db.goals.findMany({
      where: {  subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goal_id)
    const next = goals[(index + 1) % len]
    navigate({
      pathname: `../${next.goal_id}`,
      search: searchParams.toString(),
    })
  }, [db.goals, goal_id, navigate, subproject_id, searchParams])

  const toPrevious = useCallback(async () => {
    const goals = await db.goals.findMany({
      where: {  subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goal_id)
    const previous = goals[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.goal_id}`,
      search: searchParams.toString(),
    })
  }, [db.goals, goal_id, navigate, subproject_id, searchParams])

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
