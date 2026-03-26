import { useParams, useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { TbZoomScan } from 'react-icons/tb'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import {
  createCheck,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import {
  tabsAtom,
  mapBoundsAtom,
  addNotificationAtom,
  addOperationAtom,
  mapLayerSortingAtom,
} from '../../store.ts'
import type Checks from '../../models/public/Checks.ts'

export const Header = ({ autoFocusRef, from, allInline = false }) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/check'
  const { formatMessage } = useIntl()
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const { projectId, placeId, placeId2, checkId } = useParams({ strict: false })
  const navigate = useNavigate()

  const db = usePGlite()

  // Keep a ref to the current checkId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const checkIdRef = useRef(checkId)
  useEffect(() => {
    checkIdRef.current = checkId
  }, [checkId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM checks WHERE place_id = '${placeId2 ?? placeId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createCheck({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: allInline
        ? isForm
          ? `../../${id}`
          : `../${id}`
        : isForm
          ? `../../${id}/check`
          : `../${id}/check`,
      params: (prev) => ({ ...prev, checkId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM checks WHERE check_id = $1`,
        [checkId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM checks WHERE check_id = $1`, [checkId])
      addOperation({
        table: 'checks',
        rowIdName: 'check_id',
        rowId: checkId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error('Error deleting check:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT check_id FROM checks WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const checks = res?.rows
      const len = checks.length
      const index = checks.findIndex((p) => p.check_id === checkIdRef.current)
      const next = checks[(index + 1) % len]
      navigate({
        to: allInline
          ? isForm
            ? `../../${next.check_id}`
            : `../${next.check_id}`
          : isForm
            ? `../../${next.check_id}/check`
            : `../${next.check_id}`,
        params: (prev) => ({ ...prev, checkId: next.check_id }),
      })
    } catch (error) {
      console.error('Error navigating to next check:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT check_id FROM checks WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const checks = res?.rows
      const len = checks.length
      const index = checks.findIndex((p) => p.check_id === checkIdRef.current)
      const previous = checks[(index + len - 1) % len]
      navigate({
        to: allInline
          ? isForm
            ? `../../${previous.check_id}`
            : `../${previous.check_id}`
          : isForm
            ? `../../${previous.check_id}/check`
            : `../${previous.check_id}`,
        params: (prev) => ({ ...prev, checkId: previous.check_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous check:', error)
    }
  }

  const alertNoGeometry = () =>
    addNotification({
      title: formatMessage({ id: 'bCWAXB', defaultMessage: 'Keine Geometrie' }),
      body: formatMessage({
        id: 'fOO5pP',
        defaultMessage:
          'Um auf eine Kontrolle zu zoomen, erstellen Sie zuerst die Geometrie',
      }),
      intent: 'error',
    })

  const onClickZoomTo = async () => {
    const res = await db.query(
      `SELECT *, ST_AsGeoJSON(geometry)::json as geometry FROM checks WHERE check_id = $1`,
      [checkId],
    )
    const check: Checks | undefined = res?.rows?.[0]
    const geometry = check?.geometry
    if (
      !geometry ||
      (geometry as { geometries?: unknown[] }).geometries?.length === 0
    )
      return alertNoGeometry()

    // 1. show map if not happening
    if (!tabs.includes('map')) setTabs([...tabs, 'map'])

    // 2. activate layer if not active
    const level = placeId2 ? 2 : 1
    const layerRes = await db.query(
      `SELECT vl.vector_layer_id AS vl_vector_layer_id, lp.*
      FROM vector_layers vl
        LEFT JOIN layer_presentations lp ON lp.vector_layer_id = vl.vector_layer_id
      WHERE vl.project_id = $1 AND vl.own_table = 'checks' AND vl.own_table_level = $2
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

    // 3. zoom to check
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    setMapBounds(bounds)
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'ZCwpER', defaultMessage: 'Kontrolle' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName={formatMessage({ id: 'ZCwpER', defaultMessage: 'Kontrolle' })}
      siblings={
        <Button
          size="medium"
          icon={<TbZoomScan />}
          onClick={onClickZoomTo}
          title={formatMessage({
            id: 'fNN4oO',
            defaultMessage: 'Zur Kontrolle in Karte zoomen',
          })}
        />
      }
    />
  )
}
