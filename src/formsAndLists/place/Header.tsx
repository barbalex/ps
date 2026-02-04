import { useParams, useNavigate } from '@tanstack/react-router'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { createPlace, createVectorLayer } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import {
  tabsAtom,
  mapBoundsAtom,
  addOperationAtom,
  addNotificationAtom,
} from '../../store.ts'

import type Places from '../../models/public/Places.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
  from: string
  nameSingular: string
  namePlural: string
}

export const Header = ({
  autoFocusRef,
  from,
  nameSingular,
  namePlural,
}: Props) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/place/'
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const navigate = useNavigate()
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })

  const db = usePGlite()

  // Keep a ref to the current placeId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const placeIdRef = useRef(placeId2 ?? placeId)
  useEffect(() => {
    placeIdRef.current = placeId2 ?? placeId
  }, [placeId, placeId2])

  const addRow = async () => {
    const resPlace = await createPlace({
      projectId,
      subprojectId,
      parentId: placeId2 ? placeId : null,
      level: placeId2 ? 2 : 1,
    })
    const place = resPlace.rows?.[0]

    await createVectorLayer({
      projectId,
      type: 'own',
      ownTable: 'places',
      ownTableLevel: placeId2 ? 2 : 1,
      label: namePlural,
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
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM places WHERE place_id = $1`,
        [placeId2 ?? placeId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM places WHERE place_id = $1`, [
        placeId2 ?? placeId,
      ])
      addOperation({
        table: 'places',
        rowIdName: 'place_id',
        rowId: placeId2 ?? placeId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
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
      const placeIds: { place_id: string }[] = res?.rows ?? []
      const len = placeIds.length
      const index = placeIds.findIndex((p) => p.place_id === placeIdRef.current)
      const next = placeIds[(index + 1) % len]
      const idName = placeId2 ? 'placeId2' : 'placeId'
      navigate({
        to: isForm ? `../../${next.place_id}/place` : `../${next.place_id}`,
        params: (prev) => ({
          ...prev,
          [idName]: next.place_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
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
      const placeIds: { place_id: string }[] = res?.rows ?? []
      const len = placeIds.length
      const index = placeIds.findIndex((p) => p.place_id === placeIdRef.current)
      const previous = placeIds[(index + len - 1) % len]
      const idName = placeId2 ? 'placeId2' : 'placeId'
      navigate({
        to:
          isForm ?
            `../../${previous.place_id}/place`
          : `../${previous.place_id}`,
        params: (prev) => ({
          ...prev,
          [idName]: previous.place_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const alertNoGeometry = () =>
    addNotification({
      title: 'No geometry',
      body: `To zoom to a place, create it's geometry first`,
      intent: 'error',
    })

  const onClickZoomTo = async () => {
    const res = await db.query(
      `SELECT geometry FROM places WHERE place_id = $1`,
      [placeId2 ?? placeId],
    )
    const geometry: Places['geometry'] | undefined = res?.rows?.[0]?.geometry
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
  }

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
}
