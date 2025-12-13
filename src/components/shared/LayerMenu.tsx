import { Button } from '@fluentui/react-components'
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'
// import { TbMapCog } from 'react-icons/tb'
import { useParams } from '@tanstack/react-router'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { featureCollection } from '@turf/helpers'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import { mapBoundsAtom, addOperationAtom } from '../../store.ts'

export const LayerMenu = ({ table, level, placeNamePlural, from }) => {
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addOperation = useSetAtom(addOperationAtom)

  const { projectId, subprojectId } = useParams({ from })

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT lp.* 
    FROM layer_presentations lp
      inner join vector_layers vl on lp.vector_layer_id = vl.vector_layer_id
    WHERE vl.project_id = $1 AND vl.type = $2`,
    [projectId, `${table}${level}`],
  )
  const layerPresentation = res?.rows?.[0]

  const showLayer = layerPresentation?.active ?? false
  const onClickShowLayer = () => {
    db.query(
      `UPDATE layer_presentations SET active = $1 WHERE layer_presentation_id = $2`,
      [!showLayer, layerPresentation?.layer_presentation_id],
    )
  }

  const onClickZoomToLayer = async () => {
    // get all geometries from layer
    // first get all places with level
    // then get all actions/checks/occurrences with place_id
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
    } else if (table === 'occurrences') {
      const res = await db.query(
        `SELECT occurrence_id, geometry FROM occurrences WHERE place_id = ANY($1)`,
        [places.map((place) => place.place_id)],
      )
      const occurrences = res?.rows
      geometries = occurrences.map((o) => o.geometry)
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
          showLayer ?
            `Show ${placeNamePlural ?? table} layer in map`
          : `Remove ${placeNamePlural ?? table} layer from map`
        }
      />
      <Button
        size="medium"
        icon={<TbZoomScan />}
        onClick={onClickZoomToLayer}
        title={`Zoom to ${placeNamePlural ?? table} in map`}
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
