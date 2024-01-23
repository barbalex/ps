import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'
import { createPlace } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { DropdownField } from '../components/shared/DropdownField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { project_id, subproject_id, place_id, place_id2 } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.places.liveUnique({ where: { place_id } }),
    [place_id],
  )

  const { results: placeLevels } = useLiveQuery(
    db.place_levels.liveMany({
      where: {
        deleted: false,
        project_id,
        level: place_id2 ? 2 : 1,
      },
    }),
  )
  const placeNameSingular = placeLevels?.[0]?.name_singular ?? 'Place'

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places${
    place_id2 ? `/${place_id}/places` : ''
  }`

  const addRow = useCallback(async () => {
    const data = await createPlace({
      db,
      project_id,
      subproject_id,
      parent_id: place_id2 ? place_id : null,
      level: place_id2 ? 2 : 1,
    })
    console.log('place, addRow, data:', data)
    await db.places.create({ data })
    navigate(`${baseUrl}/${data.place_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, place_id, place_id2, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.places.delete({
      where: { place_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.places, navigate, place_id])

  const toNext = useCallback(async () => {
    const places = await db.places.findMany({
      where: {
        deleted: false,
        parent_id: place_id2 ? place_id : null,
        subproject_id,
      },
      orderBy: { label: 'asc' },
    })
    const len = places.length
    const index = places.findIndex((p) => p.place_id === place_id)
    const next = places[(index + 1) % len]
    navigate(`${baseUrl}/${next.place_id}`)
  }, [baseUrl, db.places, navigate, place_id, place_id2, subproject_id])

  const toPrevious = useCallback(async () => {
    const places = await db.places.findMany({
      where: {
        deleted: false,
        parent_id: place_id2 ? place_id : null,
        subproject_id,
      },
      orderBy: { label: 'asc' },
    })
    const len = places.length
    const index = places.findIndex((p) => p.place_id === place_id)
    const previous = places[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.place_id}`)
  }, [baseUrl, db.places, navigate, place_id, place_id2, subproject_id])

  const row: Place = results

  // TODO: only show parent place if level 2 exists in place_levels
  const parentPlaceWhere = useMemo(
    () => ({ deleted: false, level: 1, subproject_id }),
    [subproject_id],
  )

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.places.update({
        where: { place_id },
        data: { [name]: value },
      })
    },
    [db.places, place_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('place, row:', row)

  return (
    <div className="form-outer-container">
      <FormHeader
        title={placeNameSingular}
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName={placeNameSingular}
      />
      <div className="form-container">
        <TextFieldInactive label="ID" name="place_id" value={row.place_id} />
        <TextField
          label="Level"
          name="level"
          type="number"
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
        <Jsonb
          table="places"
          idField="place_id"
          id={row.place_id}
          data={row.data ?? {}}
          autoFocus={row.level !== 2}
          ref={row.level !== 2 ? autoFocusRef : undefined}
        />
      </div>
    </div>
  )
}
