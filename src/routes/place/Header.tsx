import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useLiveQuery } from '@electric-sql/pglite-react'

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
  const { project_id, subproject_id, place_id, place_id2 } = useParams()

  const db = usePGlite()

  const results = useLiveQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 AND level = $2`,
    [project_id, place_id2 ? 2 : 1],
  )
  const placeLevels = results?.rows ?? []
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
      type: 'own',
      own_table: 'places',
      own_table_level: place_id2 ? 2 : 1,
      label: placeNamePlural,
    })
    const columnsVL = Object.keys(vectorLayer).join(',')
    const valuesVL = Object.values(vectorLayer)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    const resultVL = await db.query(
      `INSERT INTO vector_layers (${columnsVL}) VALUES (${valuesVL}) RETURNING *`,
      Object.values(vectorLayer),
    )
    const newVectorLayer = resultVL.rows?.[0]

    const newVLD = createVectorLayerDisplay({
      vector_layer_id: newVectorLayer.vector_layer_id,
    })
    const columnsVLD = Object.keys(newVLD).join(',')
    const valuesVLD = Object.values(newVLD)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    db.query(
      `INSERT INTO vector_layer_displays (${columnsVLD}) VALUES (${valuesVLD})`,
      Object.values(newVLD),
    )

    const newLP = createLayerPresentation({
      vector_layer_id: newVectorLayer.vector_layer_id,
    })
    const columnsLP = Object.keys(newLP).join(',')
    const valuesLP = Object.values(newLP)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    db.query(
      `INSERT INTO layer_presentations (${columnsLP}) VALUES (${valuesLP})`,
      Object.values(newLP),
    )

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
    db.query(`DELETE FROM places WHERE place_id = $1`, [place_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, place_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM places WHERE parent_id = $1 AND subproject_id = $2 ORDER BY label ASC`,
      [place_id2 ? place_id : null, subproject_id],
    )
    const places = res.rows
    const len = places.length
    const index = places.findIndex((p) => p.place_id === place_id)
    const next = places[(index + 1) % len]
    navigate({
      pathname: `../${next.place_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, searchParams, subproject_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM places WHERE parent_id = $1 AND subproject_id = $2 ORDER BY label ASC`,
      [place_id2 ? place_id : null, subproject_id],
    )
    const places = res.rows
    const len = places.length
    const index = places.findIndex((p) => p.place_id === place_id)
    const previous = places[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, searchParams, subproject_id])

  const alertNoGeometry = useCallback(async () => {
    const data = await createNotification({
      title: 'No geometry',
      body: `To zoom to a place, create it's geometry first`,
      intent: 'error',
    })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    db.query(
      `INSERT INTO notifications (${columns}) VALUES (${values})`,
      Object.values(data),
    )
  }, [db])

  const onClickZoomTo = useCallback(async () => {
    const res = await db.query(`SELECT * FROM places WHERE place_id = $1`, [
      place_id2 ?? place_id,
    ])
    const place = res.rows?.[0]
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
  }, [db, place_id2, place_id, tabs, alertNoGeometry, setMapBounds, setTabs])

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
