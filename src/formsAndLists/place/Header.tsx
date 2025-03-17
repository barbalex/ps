import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import {
  createPlace,
  createVectorLayer,
  createVectorLayerDisplay,
  createNotification,
  createLayerPresentation,
} from '../../modules/createRows.ts'
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
  const { projectId, subprojectId, placeId, placeId2 } = useParams()

  const db = usePGlite()

  const results = useLiveIncrementalQuery(
    `
    SELECT 
      place_level_id, 
      name_singular, 
      name_plural 
    FROM place_levels 
    WHERE 
      project_id = $1 
      AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
    'place_level_id',
  )
  const placeLevels = results?.rows ?? []
  const placeNameSingular = placeLevels?.[0]?.name_singular ?? 'Place'
  const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

  const addRow = useCallback(async () => {
    const resPlace = await createPlace({
      db,
      project_id: projectId,
      subproject_id: subprojectId,
      parent_id: placeId2 ? placeId : null,
      level: placeId2 ? 2 : 1,
    })
    const place = resPlace.rows?.[0]

    // need to create a corresponding vector layer and vector layer display
    const resVL = createVectorLayer({
      projectId,
      type: 'own',
      own_table: 'places',
      own_table_level: placeId2 ? 2 : 1,
      label: placeNamePlural,
      db,
    })
    const newVectorLayer = resVL.rows?.[0]

    createVectorLayerDisplay({
      vector_layer_id: newVectorLayer.vector_layer_id,
      db,
    })

    await createLayerPresentation({
      vectorLayerId: newVectorLayer.vector_layer_id,
      db,
    })

    navigate({
      pathname: `../${place.place_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db,
    navigate,
    placeNamePlural,
    placeId,
    placeId2,
    projectId,
    searchParams,
    subprojectId,
  ])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM places WHERE place_id = $1`, [placeId])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, placeId, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `
      SELECT place_id 
      FROM places 
      WHERE 
        parent_id ${placeId2 ? `= '${placeId}'` : `IS NULL`} 
        AND subproject_id = $1 
      ORDER BY label
      `,
      [subprojectId],
    )
    const places = res?.rows ?? []
    const len = places.length
    const index = places.findIndex((p) => p.place_id === placeId)
    const next = places[(index + 1) % len]
    navigate({
      pathname: `../${next.place_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, placeId, placeId2, searchParams, subprojectId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `
      SELECT place_id 
      FROM places 
      WHERE 
        parent_id ${placeId2 ? `= '${placeId}'` : `IS NULL`} 
        AND subproject_id = $1 
      ORDER BY label
      `,
      [subprojectId],
    )
    const places = res?.rows ?? []
    const len = places.length
    const index = places.findIndex((p) => p.place_id === placeId)
    const previous = places[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, placeId, placeId2, searchParams, subprojectId])

  const alertNoGeometry = useCallback(() => {
    createNotification({
      title: 'No geometry',
      body: `To zoom to a place, create it's geometry first`,
      intent: 'error',
      db,
    })
  }, [db])

  const onClickZoomTo = useCallback(async () => {
    const res = await db.query(`SELECT * FROM places WHERE place_id = $1`, [
      placeId2 ?? placeId,
    ])
    const place = res?.rows?.[0]
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
  }, [db, placeId2, placeId, tabs, alertNoGeometry, setMapBounds, setTabs])

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
