import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Units as Unit } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { unit as createUnitPreset } from '../modules/dataPresets'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { SwitchField } from '../components/shared/SwitchField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, unit_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.units.liveUnique({ where: { unit_id } }))

  const addRow = useCallback(async () => {
    const newUnit = createUnitPreset()
    await db.units.create({
      data: { ...newUnit, project_id },
    })
    navigate(`/projects/${project_id}/units/${newUnit.unit_id}`)
  }, [db.units, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.units.delete({
      where: {
        unit_id,
      },
    })
    navigate(`/projects/${project_id}/units`)
  }, [db.units, navigate, project_id, unit_id])

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
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="unit" />
      <TextFieldInactive label="ID" name="unit_id" value={row.unit_id} />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <SwitchField
        label="Use for action values"
        name="use_for_action_values"
        value={row.use_for_action_values ?? false}
        onChange={onChange}
      />
      <SwitchField
        label="Use for action report values"
        name="use_for_action_report_values"
        value={row.use_for_action_report_values ?? false}
        onChange={onChange}
      />
      <SwitchField
        label="Use for check values"
        name="use_for_check_values"
        value={row.use_for_check_values ?? false}
        onChange={onChange}
      />
      <SwitchField
        label="Use for place report values"
        name="use_for_place_report_values"
        value={row.use_for_place_report_values ?? false}
        onChange={onChange}
      />
      <SwitchField
        label="Use for goal report values"
        name="use_for_goal_report_values"
        value={row.use_for_goal_report_values ?? false}
        onChange={onChange}
      />
      <SwitchField
        label="Use for subproject taxa"
        name="use_for_subproject_taxa"
        value={row.use_for_subproject_taxa ?? false}
        onChange={onChange}
      />
      <SwitchField
        label="Use for check taxa"
        name="use_for_check_taxa"
        value={row.use_for_check_taxa ?? false}
        onChange={onChange}
      />
      <SwitchField
        label="Summable"
        name="summable"
        value={row.summable ?? false}
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
