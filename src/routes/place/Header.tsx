import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import {
  createPlace,
  createVectorLayer,
  createVectorLayerDisplay,
} from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

type Props = {
  autoFocusRef: React.RefObject<HTMLInputElement>
}
export const Header = memo(({ autoFocusRef }: Props) => {
  const navigate = useNavigate()
  const { project_id, subproject_id, place_id, place_id2 } = useParams()

  const { db } = useElectric()!
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
  const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

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
    await db.places.create({ data })
    // need to create a corresponding vector layer and vector layer display
    const vectorLayer = createVectorLayer({
      project_id,
      type: place_id2 ? 'places2' : 'places1',
      label: placeNamePlural,
    })
    const newVectorLayer = await db.vector_layers.create({ data: vectorLayer })
    const newVLD = createVectorLayerDisplay({
      data_table: place_id2 ? 'places2' : 'places1',
      vector_layer_id: newVectorLayer.vector_layer_id,
    })
    db.vector_layer_displays.create({ data: newVLD })

    navigate(`${baseUrl}/${data.place_id}`)
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    baseUrl,
    db,
    navigate,
    placeNamePlural,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.places.delete({
      where: { place_id },
    })
    // TODO: delete corresponding vector layer and vector layer display
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

  return (
    <FormHeader
      title={placeNameSingular}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={placeNameSingular}
    />
  )
})
