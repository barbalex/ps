import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { TbZoomScan, TbHistory } from 'react-icons/tb'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { bbox } from '@turf/bbox'

import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import {
  createPlace,
  createVectorLayer,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import {
  tabsAtom,
  mapBoundsAtom,
  addOperationAtom,
  addNotificationAtom,
  mapLayerSortingAtom,
  onlineAtom,
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
  const { formatMessage } = useIntl()
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/place' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_'
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const online = useAtomValue(onlineAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })

  const db = usePGlite()
  const projectRes = useLiveQuery(
    `SELECT enable_histories FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const historiesEnabled = projectRes?.rows?.[0]?.enable_histories === true
  const basePath = placeId2 ?
      `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}`
  const historiesPath = `${basePath}/histories`
  const placePath = `${basePath}/place`
  const isHistoryRoute = location.pathname.startsWith(`${historiesPath}/`)

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
      to: isForm
        ? `../../${place.place_id}/place`
        : `../${place.place_id}/place`,
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
        to: isForm
          ? `../../${previous.place_id}/place`
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
      title: formatMessage({ id: 'bCWAXB', defaultMessage: 'Keine Geometrie' }),
      body: formatMessage(
        {
          id: 'bDCGHI',
          defaultMessage:
            'Um auf {place} zu zoomen, erstellen Sie zuerst die Geometrie',
        },
        { place: nameSingular },
      ),
      intent: 'error',
    })

  const onClickZoomTo = async () => {
    const res = await db.query(
      `SELECT ST_AsGeoJSON(geometry)::json as geometry FROM places WHERE place_id = $1`,
      [placeId2 ?? placeId],
    )
    const geometry: Places['geometry'] | undefined = res?.rows?.[0]?.geometry
    if (
      !geometry ||
      (geometry as { geometries?: unknown[] }).geometries?.length === 0
    ) {
      return alertNoGeometry()
    }

    // 1. show map if not happening
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }

    // 2. activate layer if not active
    const level = placeId2 ? 2 : 1
    const layerRes = await db.query(
      `SELECT vl.vector_layer_id AS vl_vector_layer_id, lp.*
      FROM vector_layers vl
        LEFT JOIN layer_presentations lp ON lp.vector_layer_id = vl.vector_layer_id
      WHERE vl.project_id = $1 AND vl.own_table = 'places' AND vl.own_table_level = $2
      ORDER BY lp.active DESC, lp.layer_presentation_id
      LIMIT 1`,
      [projectId, level],
    )
    const layerRow = layerRes?.rows?.[0]
    const vectorLayerId: string | undefined = layerRow?.vl_vector_layer_id
    let lpId: string | undefined = layerRow?.layer_presentation_id
    if (!lpId && vectorLayerId) {
      lpId = await createLayerPresentation({ vectorLayerId, active: true })
    } else if (lpId && !layerRow?.active) {
      await db.query(
        `UPDATE layer_presentations SET active = true WHERE layer_presentation_id = $1`,
        [lpId],
      )
      addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: lpId,
        operation: 'update',
        draft: { active: true },
        prev: { ...layerRow },
      })
    }
    if (lpId && !mapLayerSorting.includes(lpId)) {
      setMapLayerSorting([...mapLayerSorting, lpId])
    }

    // 3. zoom to place
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    setMapBounds(bounds)
  }

  const onClickHistory = async () => {
    if (isHistoryRoute) {
      navigate({ to: placePath })
      return
    }

    const place_id = placeId2 ?? placeId
    const res = await db.query(
      `SELECT place_history_id, updated_at
       FROM places_history
       WHERE place_id = $1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [place_id],
    )

    const latest = res?.rows?.[0] as
      | { place_history_id?: string; updated_at?: string }
      | undefined
    const historyId = latest?.place_history_id ?? latest?.updated_at

    if (historyId) {
      navigate({ to: `${historiesPath}/${historyId}` })
      return
    }

    addNotification({
      title: formatMessage({
        id: 'bPlaceNoHistoryTitle',
        defaultMessage: 'Keine Geschichte vorhanden',
      }),
      body: formatMessage({
        id: 'bPlaceNoHistoryBody',
        defaultMessage: 'Für diesen Ort gibt es noch keine gespeicherten Änderungen.',
      }),
      intent: 'warning',
    })
  }

  return (
    <FormHeader
      title={nameSingular ?? 'Place'}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={nameSingular}
      siblings={
        <>
          <Tooltip
            content={formatMessage({ id: 'bPlaceZoomTo', defaultMessage: 'zoomen' })}
          >
            <Button
              size="medium"
              icon={<TbZoomScan />}
              onClick={onClickZoomTo}
            />
          </Tooltip>
          {online && historiesEnabled && (
            <Tooltip
              content={formatMessage({
                id: 'bPlaceHistoryToggleShort',
                defaultMessage: 'geschichte',
              })}
            >
              <Button
                size="medium"
                icon={<TbHistory />}
                onClick={onClickHistory}
              />
            </Tooltip>
          )}
        </>
      }
    />
  )
}
