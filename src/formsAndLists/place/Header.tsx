import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

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
  from: string
}

export const Header = memo(({ autoFocusRef, from, nameSingular, namePlural }: Props) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/place/'
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const navigate = useNavigate()
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const resPlace = await createPlace({
      db,
      projectId,
      subprojectId,
      parentId: placeId2 ? placeId : null,
      level: placeId2 ? 2 : 1,
    })
    const place = resPlace.rows?.[0]

    // need to create a corresponding vector layer and vector layer display
    const resVL = await createVectorLayer({
      projectId,
      type: 'own',
      ownTable: 'places',
      ownTableLevel: placeId2 ? 2 : 1,
      label: namePlural,
      db,
    })
    const newVectorLayer = resVL.rows?.[0]
    // console.log('Place.Header.addRow', {
    //   newVectorLayer,
    //   resVL,
    //   projectId,
    //   placeId2,
    //   placeNamePlural,
    // })

    createVectorLayerDisplay({
      vectorLayerId: newVectorLayer.vector_layer_id,
      db,
    })

    createLayerPresentation({
      vectorLayerId: newVectorLayer.vector_layer_id,
      db,
    })

    const idName = placeId2 ? 'placeId2' : 'placeId'
    navigate({
      to:
        isForm ? `../../${place.place_id}/place` : `../${place.place_id}/place`,
      params: (prev) => ({
        ...prev,
        [idName]: place.place_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }, [
    db,
    projectId,
    subprojectId,
    placeId2,
    placeId,
    namePlural,
    navigate,
    isForm,
    autoFocusRef,
  ])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM places WHERE place_id = $1`, [placeId2 ?? placeId])
    navigate({ to: isForm ? `../..` : `..` })
  }, [db, isForm, navigate, placeId, placeId2])

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
    const index = places.findIndex((p) => p.place_id === (placeId2 ?? placeId))
    const next = places[(index + 1) % len]
    const idName = placeId2 ? 'placeId2' : 'placeId'
    navigate({
      to: isForm ? `../../${next.place_id}/place` : `../${next.place_id}`,
      params: (prev) => ({
        ...prev,
        [idName]: next.place_id,
      }),
    })
  }, [db, isForm, navigate, placeId, placeId2, subprojectId])

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
    const index = places.findIndex((p) => p.place_id === (placeId2 ?? placeId))
    const previous = places[(index + len - 1) % len]
    const idName = placeId2 ? 'placeId2' : 'placeId'
    navigate({
      to:
        isForm ? `../../${previous.place_id}/place` : `../${previous.place_id}`,
      params: (prev) => ({
        ...prev,
        [idName]: previous.place_id,
      }),
    })
  }, [db, isForm, navigate, placeId, placeId2, subprojectId])

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
      title={nameSingular}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={nameSingular}
      siblings={
        <Button
          size="medium"
          icon={<TbZoomScan />}
          onClick={onClickZoomTo}
          title={`Zoom to ${nameSingular} in map`}
        />
      }
    />
  )
})
