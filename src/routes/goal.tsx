import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Goals as Goal } from '../../../generated/client'
import { goal as createGoalPreset } from '../modules/dataPresets'
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

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goals.liveUnique({ where: { goal_id } }),
    [goal_id],
  )

  const addRow = useCallback(async () => {
    const newGoal = createGoalPreset()
    await db.goals.create({
      data: {
        ...newGoal,
        subproject_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${newGoal.goal_id}`,
    )
  }, [db.goals, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.goals.delete({
      where: {
        goal_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/goals`)
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
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="goal" />
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
