import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'
// import { TbMapCog } from 'react-icons/tb'
import { useParams } from '@tanstack/react-router'
import { useSetAtom, useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import {
  extentSelect,
  queryExtent,
  extentToBoundsWithMargin,
  type Extent,
} from '../../modules/geoQueries.ts'
import { createLayerPresentation } from '../../modules/createRows.ts'
import {
  mapBoundsAtom,
  addOperationAtom,
  tabsAtom,
  addNotificationAtom,
  mapLayerSortingAtom,
} from '../../store.ts'
import type LayerPresentations from '../../models/public/LayerPresentations.ts'

type Props = {
  table: string
  level: number
  placeNamePlural?: string | null
  // accepted for compatibility but not used
  from?: string
}

export const LayerMenu = ({ table, level, placeNamePlural }: Props) => {
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const { formatMessage } = useIntl()

  const tableLabelMessages: Record<
    string,
    { id: string; defaultMessage: string }
  > = {
    actions: { id: 'bEeEjJ', defaultMessage: 'Massnahmen' },
    checks: { id: 'bEcChH', defaultMessage: 'Kontrollen' },
    places: { id: 'bEbBgG', defaultMessage: 'Orte' },
  }
  const tableLabel = tableLabelMessages[table]
    ? formatMessage(tableLabelMessages[table])
    : table

  const { projectId, subprojectId } = useParams({ strict: false })

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT vl.vector_layer_id AS vl_vector_layer_id, lp.*
    FROM vector_layers vl
      LEFT JOIN layer_presentations lp ON lp.vector_layer_id = vl.vector_layer_id
    WHERE vl.project_id = $1 AND vl.own_table = $2 AND vl.own_table_level = $3
    ORDER BY lp.active DESC, lp.layer_presentation_id
    LIMIT 1`,
    [projectId, table, level],
  )
  const row = res?.rows?.[0]
  const vectorLayerId: string | undefined =
    row?.vl_vector_layer_id as string | undefined
  const layerPresentation: LayerPresentations | undefined =
    row?.layer_presentation_id
      ? (row as unknown as LayerPresentations)
      : undefined

  const showLayer = layerPresentation?.active ?? false
  const onClickShowLayer = async () => {
    const lpId = layerPresentation?.layer_presentation_id as
      | string
      | undefined
    if (showLayer) {
      // deactivate
      db.query(
        `UPDATE layer_presentations SET active = FALSE WHERE layer_presentation_id = $1`,
        [lpId],
      )
      addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: lpId,
        operation: 'update',
        draft: { active: false },
        prev: { ...layerPresentation },
      })
      setMapLayerSorting(mapLayerSorting.filter((id) => id !== lpId))
      return
    }
    // activate: open map if needed
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }
    let newLpId = lpId
    if (!newLpId && vectorLayerId) {
      newLpId = await createLayerPresentation({
        vectorLayerId: vectorLayerId as never,
        active: true,
      })
    } else if (newLpId) {
      db.query(
        `UPDATE layer_presentations SET active = TRUE WHERE layer_presentation_id = $1`,
        [newLpId],
      )
      addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: newLpId,
        operation: 'update',
        draft: { active: true },
        prev: { ...layerPresentation },
      })
    }
    if (newLpId && !mapLayerSorting.includes(newLpId)) {
      setMapLayerSorting([...mapLayerSorting, newLpId])
    }
  }

  const onClickZoomToLayer = async () => {
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }
    // activate layer if not already active
    let lpId: string | undefined = layerPresentation?.layer_presentation_id
    if (!lpId && vectorLayerId) {
      lpId = await createLayerPresentation({
        vectorLayerId: vectorLayerId as never,
        active: true,
      })
    } else if (lpId && !showLayer) {
      db.query(
        `UPDATE layer_presentations SET active = true WHERE layer_presentation_id = $1`,
        [lpId],
      )
      addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: lpId,
        operation: 'update',
        draft: { active: true },
        prev: { ...layerPresentation },
      })
    }
    if (lpId && !mapLayerSorting.includes(lpId)) {
      setMapLayerSorting([...mapLayerSorting, lpId])
    }
    // get the extent of all geometries in the layer via PostGIS
    // first get all places with level, then all actions/checks/observations with place_id
    const placesResult = await db.query<{ place_id: string }>(
      `SELECT place_id FROM places WHERE subproject_id = $1 AND level = $2`,
      [subprojectId, level],
    )
    const places = placesResult?.rows ?? []
    let extent: Extent | null = null
    if (table === 'places') {
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect()} FROM places WHERE subproject_id = $1 AND level = $2`,
        [subprojectId, level],
      )
    } else if (table === 'actions') {
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect()} FROM actions WHERE place_id = ANY($1)`,
        [places.map((place) => place.place_id)],
      )
    } else if (table === 'checks') {
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect()} FROM checks WHERE place_id = ANY($1)`,
        [places.map((place) => place.place_id)],
      )
    } else if (table === 'observations') {
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect()} FROM observations WHERE place_id = ANY($1)`,
        [places.map((place) => place.place_id)],
      )
    }
    if (!extent) {
      addNotification({
        title: formatMessage(
          {
            id: 'bCUyVz',
            defaultMessage: 'Keine Geometrien für {places} gefunden',
          },
          { places: placeNamePlural ?? tableLabel },
        ),
        intent: 'warning',
      })
      return
    }

    setMapBounds(extentToBoundsWithMargin(extent))
  }

  // TODO: implement onClickMapSettings
  // They should get their own url
  // const onClickMapSettings = () => {
  //   console.log('onClickMapSettings')
  // }

  return (
    <>
      <Button
        size="medium"
        icon={showLayer ? <MdLayersClear /> : <MdLayers />}
        onClick={onClickShowLayer}
        title={
          showLayer
            ? formatMessage(
                {
                  id: 'bCLmNo',
                  defaultMessage: '{places}-Ebene aus Karte entfernen',
                },
                { places: placeNamePlural ?? tableLabel },
              )
            : formatMessage(
                {
                  id: 'bCKlMn',
                  defaultMessage: '{places}-Ebene in Karte anzeigen',
                },
                { places: placeNamePlural ?? tableLabel },
              )
        }
      />
      <Button
        size="medium"
        icon={<TbZoomScan />}
        onClick={onClickZoomToLayer}
        title={formatMessage(
          { id: 'bCMnOp', defaultMessage: 'Auf {places} in Karte zoomen' },
          { places: placeNamePlural ?? tableLabel },
        )}
      />
      {/* <Button
        size="medium"
        icon={<TbMapCog />}
        onClick={onClickMapSettings}
        title={
          showLayer
            ? `Show ${placeNamePlural ?? table} map settings`
            : `Hide ${placeNamePlural ?? table} map settings`
        }
      /> */}
    </>
  )
}
