import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-button'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'

import {
  createPlace,
  createVectorLayer,
  createVectorLayerDisplay,
  createNotification,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import { tabsAtom, mapBoundsAtom } from '../../store.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}
export const Header = memo(({ autoFocusRef }: Props) => {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id, subproject_id, place_id, place_id2 } = useParams()

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

    const newLP = createLayerPresentation({
      vector_layer_id: newVectorLayer.vector_layer_id,
    })
    db.layer_presentations.create({ data: newLP })

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
    const data = await createNotification({
      title: 'No geometry',
      body: `To zoom to a place, create it's geometry first`,
      intent: 'error',
    })
    await db.notifications.create({ data })
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
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }

    // 2. zoom to place
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    setMapBounds(bounds)
  }, [
    db.places,
    place_id2,
    place_id,
    tabs,
    alertNoGeometry,
    setMapBounds,
    setTabs,
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
