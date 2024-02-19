import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-button'
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'
// import { TbMapCog } from 'react-icons/tb'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import bbox from '@turf/bbox'
import buffer from '@turf/buffer'
import { featureCollection } from '@turf/helpers'

import { useElectric } from '../../ElectricProvider'
import {
  Vector_layers as VectorLayer,
  Places as Place,
  Actions as Action,
  Checks as Check,
  Observations as Observation,
} from '../../generated/client'

type Props = {
  table: string
  level: integer
  placeNamePlural?: string
}
type vlResultsType = {
  results: VectorLayer
}
type GeometryType = Place[] | Action[] | Check[] | Observation[]

export const LayerMenu = memo(({ table, level, placeNamePlural }: Props) => {
  const { project_id, subproject_id } = useParams()

  const { db } = useElectric()!
  const { results: vectorLayer }: vlResultsType = useLiveQuery(
    db.vector_layers.liveFirst({
      where: { project_id, type: `${table}${level}`, deleted: false },
    }),
  )

  const showLayer = vectorLayer?.active ?? false
  const onClickShowLayer = useCallback(() => {
    db.vector_layers.update({
      where: { vector_layer_id: vectorLayer?.vector_layer_id },
      data: { active: !showLayer },
    })
  }, [db.vector_layers, showLayer, vectorLayer?.vector_layer_id])

  const onClickZoomToLayer = useCallback(async () => {
    // get all geometries from layer
    // first get all places with level
    // then get all actions/checks/observations with place_id
    let geometries: GeometryType = []
    const places: Place[] = await db.places.findMany({
      where: { subproject_id, level, deleted: false },
    })
    if (table === 'places') {
      geometries = places.map((place) => place.geometry)
    } else if (table === 'actions') {
      const actions: Action[] = await db.actions.findMany({
        where: {
          place_id: { in: places.map((place) => place.place_id) },
          deleted: false,
        },
      })
      geometries = actions.map((action) => action.geometry)
    } else if (table === 'checks') {
      const checks: Check[] = await db.checks.findMany({
        where: {
          place_id: { in: places.map((place) => place.place_id) },
          deleted: false,
        },
      })
      geometries = checks.map((check) => check.geometry)
    } else if (table === 'observations') {
      const observations: Observation[] = await db.observations.findMany({
        where: {
          place_id: { in: places.map((place) => place.place_id) },
          deleted: false,
        },
      })
      geometries = observations.map((observation) => observation.geometry)
    }
    // geometries are saved as featureCollections
    // bbox accepts a single feature or a featureCollection
    // so we need to combine all features into a single featureCollection
    const features = []
    for (const geometry of geometries) {
      if (geometry.features) {
        for (const feature of geometry.features) {
          features.push(feature)
        }
      } else {
        features.push(geometry)
      }
    }
    const fC = featureCollection(features)
    const bufferedFC = buffer(fC, 0.05)

    const newBounds = bbox(bufferedFC)
    console.log('hello LayerMenu, onClickZoomToLayer, newBounds:', newBounds)
    // map.fitBounds(newBounds)
  }, [
    db.actions,
    db.checks,
    db.observations,
    db.places,
    level,
    subproject_id,
    table,
  ])

  // TODO: implement onClickMapSettings
  // They should get their own url
  // const onClickMapSettings = useCallback(() => {
  //   console.log('onClickMapSettings')
  // }, [])

  return (
    <>
      <Button
        size="medium"
        icon={showLayer ? <MdLayersClear /> : <MdLayers />}
        onClick={onClickShowLayer}
        title={
          showLayer
            ? `Show ${placeNamePlural ?? table} layer in map`
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
})
