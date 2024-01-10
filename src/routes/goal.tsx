import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Goals as Goal } from '../../../generated/client'
import { createGoal } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, goal_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goals.liveUnique({ where: { goal_id } }),
    [goal_id],
  )

  const addRow = useCallback(async () => {
    const data = await createGoal({ db, project_id, subproject_id })
    await db.goals.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${data.goal_id}`,
    )
    autoFocusRef.current?.focus()
  }, [db, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.goals.delete({
      where: {
        goal_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/goals`)
  }, [db.goals, goal_id, navigate, project_id, subproject_id])

  const toNext = useCallback(async () => {
    const goals = await db.goals.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goal_id)
    const next = goals[(index + 1) % len]
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${next.goal_id}`,
    )
  }, [db.goals, goal_id, navigate, project_id, subproject_id])

  const toPrevious = useCallback(async () => {
    const goals = await db.goals.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = goals.length
    const index = goals.findIndex((p) => p.goal_id === goal_id)
    const previous = goals[(index + len - 1) % len]
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${previous.goal_id}`,
    )
  }, [db.goals, goal_id, navigate, project_id, subproject_id])

  const row: Goal = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.goals.update({
        where: { goal_id },
        data: { [name]: value },
      })
    },
    [db.goals, goal_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="goal"
      />
      <TextFieldInactive label="ID" name="goal_id" value={row.goal_id ?? ''} />
      <TextField
        label="Year"
        name="year"
        value={row.year ?? ''}
        type="number"
        onChange={onChange}
      />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
      <Jsonb
        table="goals"
        idField="goal_id"
        id={row.goal_id}
        data={row.data ?? {}}
      />
    </div>
  )
}
