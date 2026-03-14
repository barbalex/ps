import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'
// import { TbMapCog } from 'react-icons/tb'
import { useParams } from '@tanstack/react-router'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { featureCollection } from '@turf/helpers'
import { useSetAtom, useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import {
  mapBoundsAtom,
  addOperationAtom,
  tabsAtom,
  addNotificationAtom,
} from '../../store.ts'
import type LayerPresentations from '../../models/public/LayerPresentations.ts'

export const LayerMenu = ({ table, level, placeNamePlural, from }) => {
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
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

  const { projectId, subprojectId } = useParams({ from })

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT vl.vector_layer_id AS vl_vector_layer_id, lp.*
    FROM vector_layers vl
      INNER JOIN layer_presentations lp ON lp.vector_layer_id = vl.vector_layer_id
    WHERE vl.project_id = $1 AND vl.own_table = $2 AND vl.own_table_level = $3
    ORDER BY lp.active DESC, lp.layer_presentation_id
    LIMIT 1`,
    [projectId, table, level],
  )
  const row = res?.rows?.[0]
  const layerPresentation: LayerPresentations | undefined =
    row?.layer_presentation_id ? row : undefined

  const showLayer = layerPresentation?.active ?? false
  const onClickShowLayer = async () => {
    // open map if not already visible and we're showing the layer
    if (!showLayer && !tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }
    db.query(
      `UPDATE layer_presentations SET active = $1 WHERE layer_presentation_id = $2`,
      [!showLayer, layerPresentation.layer_presentation_id],
    )
    addOperation({
      table: 'layer_presentations',
      rowIdName: 'layer_presentation_id',
      rowId: layerPresentation.layer_presentation_id,
      operation: 'update',
      draft: { active: !showLayer },
      prev: { ...layerPresentation },
    })
  }

  const onClickZoomToLayer = async () => {
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }
    // get all geometries from layer
    // first get all places with level
    // then get all actions/checks/observations with place_id
    let geometries = []
    const placesResult = await db.query(
      `SELECT place_id, geometry FROM places WHERE subproject_id = $1 AND level = $2`,
      [subprojectId, level],
    )
    const places = placesResult?.rows
    if (table === 'places') {
      geometries = places.map((place) => place.geometry)
    } else if (table === 'actions') {
      const res = await db.query(
        `SELECT action_id, geometry FROM actions WHERE place_id = ANY($1)`,
        [places.map((place) => place.place_id)],
      )
      const actions = res?.rows
      geometries = actions.map((action) => action.geometry)
    } else if (table === 'checks') {
      const res = await db.query(
        `SELECT check_id, geometry FROM checks WHERE place_id = ANY($1)`,
        [places.map((place) => place.place_id)],
      )
      const checks = res?.rows
      geometries = checks.map((check) => check.geometry)
    } else if (table === 'observations') {
      const res = await db.query(
        `SELECT observation_id, geometry FROM observations WHERE place_id = ANY($1)`,
        [places.map((place) => place.place_id)],
      )
      const observations = res?.rows
      geometries = observations.map((o) => o.geometry)
    }
    // geometries are saved as featureCollections
    // bbox accepts a single feature or a featureCollection
    // so we need to combine all features into a single featureCollection
    const features = []
    for (const geometry of geometries) {
      if (geometry?.features) {
        for (const feature of geometry.features) {
          features.push(feature)
        }
      } else if (geometry) {
        features.push(geometry)
      }
    }
    if (!features.length) {
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

    const fC = featureCollection(features)
    const bufferedFC = buffer(fC, 0.05)

    const newBbox = bbox(bufferedFC)
    const newBounds = boundsFromBbox(newBbox)

    setMapBounds(newBounds)
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
