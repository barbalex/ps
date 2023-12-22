import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button, Switch } from '@fluentui/react-components'

import { Units as Unit } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { unit as createUnitPreset } from '../modules/dataPresets'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { project_id, unit_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.units.liveUnique({ where: { unit_id } }))

  const addRow = async () => {
    const newUnit = createUnitPreset()
    await db.units.create({
      data: { ...newUnit, project_id },
    })
    navigate(`/projects/${project_id}/units/${newUnit.unit_id}`)
  }

  const deleteRow = async () => {
    await db.units.delete({
      where: {
        unit_id,
      },
    })
    navigate(`/projects/${project_id}/units`)
  }

  const row: Unit = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.units.update({
        where: { unit_id },
        data: { [name]: value },
      })
    },
    [db.units, unit_id],
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
          title="Add new unit"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete unit"
        />
      </div>
      <TextFieldInactive label="ID" name="unit_id" value={row.unit_id} />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <Switch
        label="Use for action values"
        name="use_for_action_values"
        checked={row.use_for_action_values ?? false}
        onChange={onChange}
      />
      <Switch
        label="Use for action report values"
        name="use_for_action_report_values"
        checked={row.use_for_action_report_values ?? false}
        onChange={onChange}
      />
      <Switch
        label="Use for check values"
        name="use_for_check_values"
        checked={row.use_for_check_values ?? false}
        onChange={onChange}
      />
      <Switch
        label="Use for place report values"
        name="use_for_place_report_values"
        checked={row.use_for_place_report_values ?? false}
        onChange={onChange}
      />
      <Switch
        label="Use for goal report values"
        name="use_for_goal_report_values"
        checked={row.use_for_goal_report_values ?? false}
        onChange={onChange}
      />
      <Switch
        label="Use for subproject taxa"
        name="use_for_subproject_taxa"
        checked={row.use_for_subproject_taxa ?? false}
        onChange={onChange}
      />
      <Switch
        label="Use for check taxa"
        name="use_for_check_taxa"
        checked={row.use_for_check_taxa ?? false}
        onChange={onChange}
      />
      <Switch
        label="Summable"
        name="summable"
        checked={row.summable ?? false}
        onChange={onChange}
      />
      <TextField
        label="Sort value"
        name="sort"
        type="number"
        value={row.sort ?? ''}
        onChange={onChange}
      />
      <TextField
        label="List"
        name="list_id"
        value={row.list_id ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
