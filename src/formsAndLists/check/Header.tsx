import { useParams, useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { TbZoomScan } from 'react-icons/tb'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import type { AllGeoJSON } from '@turf/helpers'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import type { TableRowFilter } from '../../store.ts'

import {
  createCheck,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import {
  tabsAtom,
  mapBoundsAtom,
  addNotificationAtom,
  addOperationAtom,
  mapLayerSortingAtom,
} from '../../store.ts'
import type Checks from '../../models/public/Checks.ts'

export const Header = ({
  autoFocusRef,
  from,
  allInline = false,
}: {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from: string
  allInline?: boolean
}) =>  {
  // works for plain checks and for checks of a filtered view
  const isForm = from.endsWith('/checks/$checkId_/check')
  const { formatMessage, locale } = useIntl()
  const { projectId, subprojectId, placeId, placeId2, filteredViewId, checkId } =
    useParams({
      strict: false,
    })

  // names of the filtered view this check belongs to (if any)
  const resFilteredView = useLiveQuery(
    filteredViewId
      ? `SELECT name_singular_de, name_singular_en, name_singular_fr, name_singular_it, filter FROM filtered_views WHERE filtered_view_id = $1`
      : `SELECT 1 WHERE false`,
    filteredViewId ? [filteredViewId] : [],
  )
  const lang = locale.split('-')[0]
  const filteredView = resFilteredView?.rows?.[0] as
    | Record<string, unknown>
    | undefined
  const checkTitle =
    (filteredViewId &&
      ((filteredView?.[`name_singular_${lang}`] as string | null) ??
        (filteredView?.name_singular_de as string | null))) ||
    formatMessage({ id: 'ZCwpER', defaultMessage: 'Kontrolle' })

  const [tabs, setTabs] = useAtom(tabsAtom)
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const navigate = useNavigate()

  const db = usePGlite()

  // Keep a ref to the current checkId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const checkIdRef = useRef(checkId)
  useEffect(() => {
    checkIdRef.current = checkId
  }, [checkId])

  // the view's static filter narrows counts and sibling navigation
  const viewFilterString = filteredViewId
    ? filterStringFromFilter((filteredView?.filter ?? []) as TableRowFilter[])
    : ''
  const hasViewFilter = !!viewFilterString

  const basePath = `${placeId2 ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}` : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}`}${filteredViewId ? `/filtered-checks/${filteredViewId}` : ''}/checks/${checkId}`

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM checks WHERE place_id = '${placeId2 ?? placeId}'${hasViewFilter ? ` AND (${viewFilterString})` : ''}`,
  )
  const rowCount = (countRes?.rows?.[0]?.count as number) ?? 2

  const addRow = async () => {
    const id = await createCheck({
      projectId: projectId!,
      placeId: placeId2 ?? placeId!,
      filteredViewId,
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
      const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
      await db.query(`DELETE FROM checks WHERE check_id = $1`, [checkId])
      addOperation({
        table: 'checks',
        rowIdName: 'check_id',
        rowId: checkId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? ('../..' as '..') : '..' })
    } catch (error) {
      console.error('Error deleting check:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT check_id FROM checks WHERE place_id = $1${hasViewFilter ? ` AND (${viewFilterString})` : ''} ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const checks = res?.rows as { check_id: string }[]
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
        `SELECT check_id FROM checks WHERE place_id = $1${hasViewFilter ? ` AND (${viewFilterString})` : ''} ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const checks = res?.rows as { check_id: string }[]
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
          'Um auf eine Kontrolle zu zoomen, erstelle zuerst die Geometrie',
      }),
      intent: 'error',
    })

  const onClickZoomTo = async () => {
    const res = await db.query(
      `SELECT *, ST_AsGeoJSON(geometry)::json as geometry FROM checks WHERE check_id = $1`,
      [checkId],
    )
    const check = res?.rows?.[0] as Checks | undefined
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
    const layerRow = layerRes?.rows?.[0] as
      | {
          vl_vector_layer_id?: string
          layer_presentation_id?: string
          active?: boolean
        }
      | undefined
    const vectorLayerId: string | undefined = layerRow?.vl_vector_layer_id
    let lpId: string | undefined = layerRow?.layer_presentation_id
    if (!lpId && vectorLayerId) {
      lpId = await createLayerPresentation({
        vectorLayerId: vectorLayerId as never,
        active: true,
      })
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
    const buffered = buffer(geometry as AllGeoJSON, 0.05)
    const newBbox = bbox(buffered!)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    setMapBounds(bounds)
  }

  return (
    <FormHeader
      title={checkTitle}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName={checkTitle}
      siblings={
        <>
          <Button
            size="medium"
            icon={<TbZoomScan />}
            onClick={onClickZoomTo}
            title={formatMessage({
              id: 'fNN4oO',
              defaultMessage: 'Zur Kontrolle in Karte zoomen',
            })}
          />
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={`${basePath}/check`}
            historyTable="checks_history"
            rowIdField="check_id"
            rowId={checkId}
          />
        </>
      }
    />
  )
}
