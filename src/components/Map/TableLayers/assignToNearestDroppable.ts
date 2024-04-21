import nearestPoint from '@turf/nearest-point' // https://turfjs.org/docs/#nearestPoint
import pointsWithinPolygon from '@turf/points-within-polygon' // https://turfjs.org/docs/#pointsWithinPolygon
import { featureCollection, point, points } from '@turf/helpers'

import {
  Electric,
  Vector_layers as VectorLayer,
  Places as Place,
} from '../../../generated/client'

interface Props {
  db: Electric
  authUser: { email: string }
  layer: VectorLayer
  latLng: [number, number]
}

export const assignToNearestDroppable = async ({
  db,
  authUser,
  layer,
  latLng,
}: Props) => {
  console.log('hello assignToNearestDroppable', { latLng })
  let latLngPoint
  try {
    latLngPoint = point([latLng.lng, latLng.lat])
  } catch (error) {
    console.log('hello assignToNearestDroppable', { error })
  }
  console.log('hello assignToNearestDroppable', { latLngPoint })
  let latLngPoints
  try {
    latLngPoints = points([[latLng.lng, latLng.lat]])
    console.log('hello assignToNearestDroppable', { latLngPoints })
  } catch (error) {
    console.log('hello assignToNearestDroppable', { error })
  }
  // TODO: best would be to query using PostGIS functions...
  // 1. get droppable layer
  const appState = await db.app_states.findFirst({
    where: { user_email: authUser?.email },
  })
  const droppableLayer = appState?.droppable_layer
  console.log('hello assignToNearestDroppable', { appState, droppableLayer })
  // 2. get all features from droppable layer
  const places: Place[] = await db.places.findMany({
    where: {
      parent_id: droppableLayer === 'places1' ? null : { not: null },
      geometry: { not: null },
    },
  })
  console.log('hello assignToNearestDroppable', { places })
  // 3. get the nearest feature
  // 3.1 direct using nearestPoint
  // let nearestPlace
  // try {
  //   nearestPlace = nearestPoint(
  //     latLngPoint,
  //     featureCollection(places.map((p) => p.geometry)),
  //   )
  // } catch (error) {
  //   // Error: coord must be GeoJSON Point or an Array of numbers
  //   console.log('hello assignToNearestDroppable', { error })
  // }
  // console.log('hello assignToNearestDroppable', {
  //   nearestPlace,
  // })
  // 3.2 find out if the latLng is inside a feature: https://turfjs.org/docs/#pointsWithinPolygon
  for (const place of places) {
    if (!place.geometry?.features?.[0]?.geometry) {
      continue
    }
    try {
      const pointsWithin = pointsWithinPolygon(
        latLngPoints,
        place.geometry?.features?.[0]?.geometry,
      )
      console.log('hello assignToNearestDroppable', {
        pointsWithin,
        place,
      })
    } catch (error) {
      console.log('hello assignToNearestDroppable', { error, place })
    }
  }
  // 3.3 if not, find the nearest feature
  // 3.3.1: find nearest center of mass? https://turfjs.org/docs/#centerOfMass, https://turfjs.org/docs/#nearestPoint
  // 3.3.2: better but more work: create outline of all features, then find nearest outline? https://turfjs.org/docs/#pointToLineDistance
}
