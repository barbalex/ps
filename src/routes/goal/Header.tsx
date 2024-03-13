import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createGoal } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, goal_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals`

  const addRow = useCallback(async () => {
    const data = await createGoal({ db, project_id, subproject_id })
    await db.goals.create({ data })
    navigate(`${baseUrl}/${data.goal_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.goals.delete({
      where: {
        goal_id,
      },
    })
    navigate('..')
  }, [baseUrl, db.goals, goal_id, navigate])

  const toNext = useCallback(async () => {
    const goals = await db.goals.findMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goal_id)
    const next = goals[(index + 1) % len]
    navigate(`${baseUrl}/${next.goal_id}`)
  }, [baseUrl, db.goals, goal_id, navigate, subproject_id])

  const toPrevious = useCallback(async () => {
    const goals = await db.goals.findMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goal_id)
    const previous = goals[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.goal_id}`)
  }, [baseUrl, db.goals, goal_id, navigate, subproject_id])

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
