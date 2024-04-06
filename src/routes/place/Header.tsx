import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-button'
import bbox from '@turf/bbox'
import buffer from '@turf/buffer'
import { uuidv7 } from '@kripod/uuidv7'
import { useCorbadoSession } from '@corbado/react'

import {
  createPlace,
  createVectorLayer,
  createVectorLayerDisplay,
} from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'
import { boundsFromBbox } from '../../modules/boundsFromBbox'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}
export const Header = memo(({ autoFocusRef }: Props) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id, subproject_id, place_id, place_id2 } = useParams()

  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: placeLevels } = useLiveQuery(
    db.place_levels.liveMany({
      where: {
        
        project_id,
        level: place_id2 ? 2 : 1,
      },
    }),
  )
  const placeNameSingular = placeLevels?.[0]?.name_singular ?? 'Place'
  const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

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
      vector_layer_id: newVectorLayer.vector_layer_id,
    })
    db.vector_layer_displays.create({ data: newVLD })

    navigate({
      pathname: `../${data.place_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db,
    navigate,
    placeNamePlural,
    place_id,
    place_id2,
    project_id,
    searchParams,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.places.delete({ where: { place_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.places, navigate, place_id, searchParams])

  const toNext = useCallback(async () => {
    const places = await db.places.findMany({
      where: {
        
        parent_id: place_id2 ? place_id : null,
        subproject_id,
      },
      orderBy: { label: 'asc' },
    })
    const len = places.length
    const index = places.findIndex((p) => p.place_id === place_id)
    const next = places[(index + 1) % len]
    navigate({
      pathname: `../${next.place_id}`,
      search: searchParams.toString(),
    })
  }, [db.places, navigate, place_id, place_id2, searchParams, subproject_id])

  const toPrevious = useCallback(async () => {
    const places = await db.places.findMany({
      where: {
        
        parent_id: place_id2 ? place_id : null,
        subproject_id,
      },
      orderBy: { label: 'asc' },
    })
    const len = places.length
    const index = places.findIndex((p) => p.place_id === place_id)
    const previous = places[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_id}`,
      search: searchParams.toString(),
    })
  }, [db.places, navigate, place_id, place_id2, searchParams, subproject_id])

  const alertNoGeometry = useCallback(async () => {
    await db.notifications.create({
      data: {
        notification_id: uuidv7(),
        title: 'No geometry',
        body: `To zoom to a place, create it's geometry first`,
        intent: 'error',
      },
    })
  }, [db.notifications])

  const onClickZoomTo = useCallback(async () => {
    const place: Place = await db.places.findUnique({
      where: { place_id: place_id2 ?? place_id },
    })
    const geometry = place?.geometry
    if (!geometry) {
      return alertNoGeometry()
    }

    // 1. show map if not happening
    const appState = await db.app_states.findFirst({
      where: { user_email: authUser.email },
    })
    const tabs = appState?.tabs ?? []
    if (!tabs.includes('map')) {
      await db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { tabs: [...tabs, 'map'] },
      })
    }

    // 2. zoom to place
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: { map_bounds: bounds },
    })
  }, [
    db.places,
    db.app_states,
    place_id2,
    place_id,
    authUser.email,
    alertNoGeometry,
  ])

  return (
    <FormHeader
      title={placeNameSingular}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={placeNameSingular}
      siblings={
        <Button
          size="medium"
          icon={<TbZoomScan />}
          onClick={onClickZoomTo}
          title={`Zoom to ${placeNameSingular} in map`}
        />
      }
    />
  )
})
