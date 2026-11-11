import { useParams, useNavigate } from '@tanstack/react-router'
import { TbZoomScan } from 'react-icons/tb'
import * as fluentUiReactComponents from '@fluentui/react-components'
import type { TooltipProps } from '@fluentui/react-components'
import type { ComponentType } from 'react'
const { Button } = fluentUiReactComponents
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { createLayerPresentation } from '../../modules/createRows.ts'
import {
  extentSelect,
  queryExtent,
  extentToBoundsWithMargin,
} from '../../modules/geoQueries.ts'
import {
  tabsAtom,
  mapBoundsAtom,
  addOperationAtom,
  addNotificationAtom,
  mapLayerSortingAtom,
} from '../../store.ts'

// Fluent UI's TooltipProps requires `relationship`, but it is optional at runtime
const Tooltip = fluentUiReactComponents.Tooltip as ComponentType<
  Omit<TooltipProps, 'relationship'> & {
    relationship?: TooltipProps['relationship']
  }
>

export const Header = ({
  from,
}: {
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
}) => {
  const { projectId, subprojectId, placeId, placeId2, observationId } =
    useParams({ strict: false })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const base = `/data/projects/${projectId}/subprojects/${subprojectId}`
  const basePath = from.includes('observations-to-assess')
    ? `${base}/observations-to-assess/${observationId}`
    : from.includes('observations-not-to-assign')
      ? `${base}/observations-not-to-assign/${observationId}`
      : placeId2
        ? `${base}/places/${placeId}/places/${placeId2}/observations/${observationId}`
        : `${base}/places/${placeId}/observations/${observationId}`

  const db = usePGlite()

  // Keep a ref to the current observationId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const observationIdRef = useRef(observationId)
  useEffect(() => {
    observationIdRef.current = observationId
  }, [observationId])

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT observation_id FROM observations WHERE place_id = $1 ORDER BY label',
        [placeId2 ?? placeId],
      )
      const observations = res?.rows as { observation_id: string }[]
      const len = observations.length
      const index = observations.findIndex(
        (p) => p.observation_id === observationIdRef.current,
      )
      const next = observations[(index + 1) % len]
      navigate({
        to: `../${next.observation_id}`,
        params: (prev) => ({ ...prev, observationId: next.observation_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT observation_id FROM observations WHERE place_id = $1 ORDER BY label',
        [placeId2 ?? placeId],
      )
      const observations = res?.rows as { observation_id: string }[]
      const len = observations.length
      const index = observations.findIndex(
        (p) => p.observation_id === observationIdRef.current,
      )
      const previous = observations[(index + len - 1) % len]
      navigate({
        to: `../${previous.observation_id}`,
        params: (prev) => ({ ...prev, observationId: previous.observation_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  // mirrors queryExtent returning null: no geometry or an empty one
  // (e.g. GeometryCollection without parts) can not be zoomed to
  const geometryRes = useLiveQuery(
    `SELECT (geometry IS NOT NULL AND NOT ST_IsEmpty(geometry)) AS has_geometry FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const hasGeometry = geometryRes?.rows?.[0]?.has_geometry === true

  const nameSingular = formatMessage({
    id: 'gKq4qF',
    defaultMessage: 'Beobachtung',
  })

  const alertNoGeometry = () =>
    addNotification({
      title: formatMessage({ id: 'bCWAXB', defaultMessage: 'Keine Geometrie' }),
      body: formatMessage(
        {
          id: 'bDCGHI',
          defaultMessage:
            'Um auf {place} zu zoomen, erstelle zuerst die Geometrie',
        },
        { place: nameSingular },
      ),
      intent: 'error',
    })

  const onClickZoomTo = async () => {
    const extent = await queryExtent(
      db,
      `SELECT ${extentSelect()} FROM observations WHERE observation_id = $1`,
      [observationId],
    )
    if (!extent) return alertNoGeometry()

    // 1. show map if not happening
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }

    // 2. activate the layer this observation is drawn by: assigned to a
    // place -> observations_assigned of that place's level; flagged
    // not_to_assign -> observations_not_to_assign; else to assess
    const obsRes = await db.query(
      `SELECT o.place_id, o.not_to_assign, p.parent_id
      FROM observations o
        LEFT JOIN places p ON p.place_id = o.place_id
      WHERE o.observation_id = $1`,
      [observationId],
    )
    const obs = obsRes?.rows?.[0] as
      | {
          place_id: string | null
          not_to_assign: boolean | null
          parent_id: string | null
        }
      | undefined
    let ownTable = 'observations_to_assess'
    let level: number | null = null
    if (obs?.place_id) {
      ownTable = 'observations_assigned'
      level = obs.parent_id === null ? 1 : 2
    } else if (obs?.not_to_assign) {
      ownTable = 'observations_not_to_assign'
    }
    const layerRes = await db.query(
      `SELECT vl.vector_layer_id AS vl_vector_layer_id, lp.*
      FROM vector_layers vl
        LEFT JOIN layer_presentations lp ON lp.vector_layer_id = vl.vector_layer_id
      WHERE vl.project_id = $1 AND vl.own_table = $2 AND vl.own_table_level IS NOT DISTINCT FROM $3
      ORDER BY lp.active DESC, lp.layer_presentation_id
      LIMIT 1`,
      [projectId, ownTable, level],
    )
    const layerRow = layerRes?.rows?.[0] as
      | {
          vl_vector_layer_id: string
          layer_presentation_id: string
          active: boolean | null
          [key: string]: unknown
        }
      | undefined
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
        prev: { ...(layerRow ?? {}) },
      })
    }
    if (lpId && !mapLayerSorting.includes(lpId)) {
      setMapLayerSorting([...mapLayerSorting, lpId])
    }

    // 3. zoom to observation
    setMapBounds(extentToBoundsWithMargin(extent))
  }

  const zoomButton = (
    <Button
      size="medium"
      icon={<TbZoomScan />}
      disabled={!hasGeometry}
      onClick={onClickZoomTo}
    />
  )
  const zoomTooltipContent = hasGeometry
    ? formatMessage({ id: 'bPlaceZoomTo', defaultMessage: 'zoomen' })
    : formatMessage(
        {
          id: 'bDCGHI',
          defaultMessage:
            'Um auf {place} zu zoomen, erstelle zuerst die Geometrie',
        },
        { place: nameSingular },
      )

  return (
    <FormHeader
      title={formatMessage({ id: 'obs0Hdr', defaultMessage: 'Beobachtung' })}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="observation"
      siblings={
        <>
          <Tooltip content={zoomTooltipContent}>
            {/* disabled buttons swallow pointer events, so the tooltip
                needs a wrapper to still open on hover */}
            {hasGeometry ? zoomButton : <span>{zoomButton}</span>}
          </Tooltip>
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={basePath}
            historyTable="observations_history"
            rowIdField="observation_id"
            rowId={observationId}
          />
        </>
      }
    />
  )
}
