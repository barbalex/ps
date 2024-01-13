import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceLevels as PlaceLevel } from '../../../generated/client'
import { createPlaceLevel } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { SwitchField } from '../components/shared/SwitchField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, place_level_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_levels.liveUnique({ where: { place_level_id } }),
    [place_level_id],
  )

  const baseUrl = `/projects/${project_id}/place-levels`

  const addRow = useCallback(async () => {
    const placeLevel = createPlaceLevel()
    await db.place_levels.create({
      data: { ...placeLevel, project_id },
    })
    navigate(`${baseUrl}/${placeLevel.place_level_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db.place_levels, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.place_levels.delete({
      where: { place_level_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.place_levels, navigate, place_level_id])

  const toNext = useCallback(async () => {
    const placeLevels = await db.place_levels.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = placeLevels.length
    const index = placeLevels.findIndex(
      (p) => p.place_level_id === place_level_id,
    )
    const next = placeLevels[(index + 1) % len]
    navigate(`${baseUrl}/${next.place_level_id}`)
  }, [baseUrl, db.place_levels, navigate, place_level_id, project_id])

  const toPrevious = useCallback(async () => {
    const placeLevels = await db.place_levels.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = placeLevels.length
    const index = placeLevels.findIndex(
      (p) => p.place_level_id === place_level_id,
    )
    const previous = placeLevels[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.place_level_id}`)
  }, [baseUrl, db.place_levels, navigate, place_level_id, project_id])

  const row: PlaceLevel = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const valueToUse = name === 'level' ? +value : value
      db.place_levels.update({
        where: { place_level_id },
        data: { [name]: valueToUse },
      })
    },
    [db.place_levels, place_level_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('place level', row)

  return (
    <>
      <FormHeader
        title="Place level"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="place level"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="place_level_id"
          value={row.place_level_id}
        />
        <RadioGroupField
          label="Level"
          name="level"
          list={[1, 2]}
          value={row.level ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Name (singular)"
          name="name_singular"
          value={row.name_singular ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
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
        <SwitchField
          label="Enable reports"
          name="reports"
          value={row.reports ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable report values"
          name="report_values"
          value={row.report_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable actions"
          name="actions"
          value={row.actions ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable action values"
          name="action_values"
          value={row.action_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable action reports"
          name="action_reports"
          value={row.action_reports ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable checks"
          name="checks"
          value={row.checks ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable check values"
          name="check_values"
          value={row.check_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable check taxa"
          name="check_taxa"
          value={row.check_taxa ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable observation references"
          name="observation_references"
          value={row.observation_references ?? false}
          onChange={onChange}
        />
      </div>
    </>
  )
}
