import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import {
  Button,
  Field,
  Radio,
  RadioGroup,
  Switch,
} from '@fluentui/react-components'

import { PlaceLevels as PlaceLevel } from '../../../generated/client'
import { placeLevel as createPlaceLevelPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { project_id, place_level_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_levels.liveUnique({ where: { place_level_id } }),
    [place_level_id],
  )

  const addRow = async () => {
    const newPlaceLevel = createPlaceLevelPreset()
    await db.place_levels.create({
      data: { ...newPlaceLevel, project_id },
    })
    navigate(
      `/projects/${project_id}/place-levels/${newPlaceLevel.place_level_id}`,
    )
  }

  const deleteRow = async () => {
    await db.place_levels.delete({
      where: {
        place_level_id,
      },
    })
    navigate(`/projects/${project_id}/place-levels`)
  }

  const row: PlaceLevel = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.place_levels.update({
        where: { place_level_id },
        data: { [name]: value },
      })
    },
    [db.place_levels, place_level_id],
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
          title="Add new place level"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete place level"
        />
      </div>
      <TextFieldInactive
        label="ID"
        name="place_level_id"
        value={row.place_level_id}
      />
      <Field label="Level">
        <RadioGroup
          layout="horizontal"
          value={row.level ?? ''}
          name="level"
          onChange={(e, data) => {
            onChange({ target: { name: 'level', value: +data.value } })
          }}
        >
          <Radio label="1" value={1} />
          <Radio label="2" value={2} />
        </RadioGroup>
      </Field>
      <TextField
        label="Name (singular)"
        name="name_singular"
        value={row.name_singular ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Name (plural)"
        name="name_plural"
        value={row.name_plural ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Name (short)"
        name="name_short"
        value={row.name_short ?? ''}
        onChange={onChange}
      />
      <Switch
        label="Enable reports"
        name="reports"
        checked={row.reports ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable report values"
        name="report_values"
        checked={row.report_values ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable actions"
        name="actions"
        checked={row.actions ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable action values"
        name="action_values"
        checked={row.action_values ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable action reports"
        name="action_reports"
        checked={row.action_reports ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable checks"
        name="checks"
        checked={row.checks ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable check values"
        name="check_values"
        checked={row.check_values ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable check taxa"
        name="check_taxa"
        checked={row.check_taxa ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable observation references"
        name="observation_references"
        checked={row.observation_references ?? false}
        onChange={onChange}
      />
      <Switch
        label="Enable uploading files to places at this level"
        name="files_active"
        checked={row.files_active ?? false}
        onChange={onChange}
      />
    </div>
  )
}
