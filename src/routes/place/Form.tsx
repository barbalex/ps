import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { DropdownField } from '../../components/shared/DropdownField'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { EditingGeometry } from '../../components/shared/EditingGeometry'
import { Loading } from '../../components/shared/Loading'

import '../../form.css'

export const PlaceForm = ({ autoFocusRef }) => {
  const { subproject_id, place_id, place_id2 } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.places.liveUnique({ where: { place_id: place_id2 ?? place_id } }),
  )

  // TODO: only show parent place if level 2 exists in place_levels
  const parentPlaceWhere = useMemo(
    () => ({  level: 1, subproject_id }),
    [subproject_id],
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const valueToUse = name === 'level' ? +value : value
      console.log('hello PlaceForm, onChange:', {
        name,
        valueToUse,
        value,
        e,
        data,
      })
      db.places.update({
        where: { place_id },
        data: { [name]: valueToUse },
      })
    },
    [db.places, place_id],
  )

  if (!row) return <Loading />

  // console.log('hello place form, row:', row)

  return (
    <div className="form-container">
      <TextFieldInactive label="ID" name="place_id" value={row.place_id} />
      <RadioGroupField
        label="Level"
        name="level"
        list={[1, 2]}
        value={row.level ?? ''}
        onChange={onChange}
      />
      {row.level === 2 && (
        <DropdownField
          label="Parent Place"
          name="parent_id"
          idField="place_id"
          table="places"
          where={parentPlaceWhere}
          value={row.parent_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
      )}
      <TextField
        label="Since when does this place exist? (year)"
        name="since"
        value={row.since}
        type="number"
        onChange={onChange}
      />
      <TextField
        label="Until when did this place exist? (year)"
        name="until"
        value={row.until}
        type="number"
        onChange={onChange}
      />
      <Jsonb
        table="places"
        idField="place_id"
        id={row.place_id}
        data={row.data ?? {}}
        autoFocus={row.level !== 2}
        ref={row.level !== 2 ? autoFocusRef : undefined}
      />
      <EditingGeometry row={row} table="places" />
    </div>
  )
}
