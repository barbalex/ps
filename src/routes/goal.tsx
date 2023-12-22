import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'

import { Goals as Goal } from '../../../generated/client'
import { goal as createGoalPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { subproject_id, goal_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goals.liveUnique({ where: { goal_id } }),
    [goal_id],
  )

  const addRow = async () => {
    const newGoal = createGoalPreset()
    await db.goals.create({
      data: {
        ...newGoal,
        project_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${newGoal.goal_id}`,
    )
  }

  const deleteRow = async () => {
    await db.goals.delete({
      where: {
        goal_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/goals`)
  }

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
      <div className="controls">
        <Button
          size="large"
          icon={<FaPlus />}
          onClick={addRow}
          title="Add new goal"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete goal"
        />
      </div>
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
      />
    </div>
  )
}
