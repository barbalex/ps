import pointsWithinPolygon from '@turf/points-within-polygon' // https://turfjs.org/docs/#pointsWithinPolygon
import convex from '@turf/convex' // https://turfjs.org/docs/#convex
import polygonToLine from '@turf/polygon-to-line' // https://turfjs.org/docs/#polygonToLine
import pointToLineDistance from '@turf/point-to-line-distance'
import distance from '@turf/distance'
import { point, points } from '@turf/helpers'
import { Map } from '@types/leaflet'

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
  occurrenceId: uuid
  map: Map
}

export const assignToNearestDroppable = async ({
  db,
  authUser,
  latLng,
  occurrenceId,
  map,
}: Props) => {
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
  //     does not work because of the error: coord must be GeoJSON Point or an Array of numbers

  // 3.2 find out if the latLng is inside a feature: https://turfjs.org/docs/#pointsWithinPolygon
  //     Because of featureCollection, use the convex hull: https://turfjs.org/docs/#convex
  const idsOfPlacesContainingLatLng = []
  for (const place of places) {
    let convexedPlace
    try {
      convexedPlace = convex(place.geometry)
    } catch (error) {
      console.log('hello assignToNearestDroppable convexed', { error })
    }
    let pointsWithin
    try {
      pointsWithin = pointsWithinPolygon(latLngPoints, convexedPlace)
    } catch (error) {
      // an error occurres if geometry is not polygon, so ignore
    }
    const isInside = pointsWithin?.features?.length > 0
    console.log('hello assignToNearestDroppable convexed', {
      place,
      isInside,
    })
    // if isInside, assign, then return
    if (!isInside) continue
    idsOfPlacesContainingLatLng.push(place.place_id)
  }


  // 3.3 if not, find the nearest feature
  // 3.3.1: find nearest center of mass? https://turfjs.org/docs/#centerOfMass, https://turfjs.org/docs/#nearestPoint
  // 3.3.2: better but more work:
  //        create convex outline of all places (https://turfjs.org/docs/#convex),
  //        convert that to a line (https://turfjs.org/docs/#polygonToLine),
  //        for every occurrence find nearest outline (https://turfjs.org/docs/#pointToLineDistance)
  //        choose closest
  //        alternative solution: https://github.com/Turfjs/turf/issues/1743
  const distances = places.map((place) => {
    const placeContainsOccurrence = idsOfPlacesContainingLatLng.includes(
      place.place_id,
    )
    if (placeContainsOccurrence) {
      return { place_id: place.place_id, distance: 0 }
    }

    let convexedPlace
    try {
      convexedPlace = convex(place.geometry)
    } catch (error) {
      console.log('hello assignToNearestDroppable distance', { error })
    }
    let hullLine
    try {
      hullLine = polygonToLine(convexedPlace)
    } catch (error) {
      console.log('hello assignToNearestDroppable distance', { error })
    }
    let distance
    try {
      distance = pointToLineDistance(latLngPoint, hullLine)
    } catch (error) {
      console.log('hello assignToNearestDroppable distance', { error })
    }
    return { place_id: place.place_id, distance }
  })
  console.log('hello assignToNearestDroppable distance', { distances })
  // get width of map in kilometres
  const mapBounds = map.getBounds()
  const mapNorthEast = mapBounds.getNorthEast()
  const mapNorthWest = mapBounds.getNorthWest()
  const mapWidth = distance(
    point([mapNorthEast.lng, mapNorthEast.lat]),
    point([mapNorthWest.lng, mapNorthWest.lat]),
  )
  const minDistance = mapWidth / 15
  const minDistances = distances.filter((d) => d.distance < minDistance)
  console.log('hello assignToNearestDroppable distance', {
    mapWidth,
    minDistance,
    minDistances,
    distances,
  })

  // if (idsOfPlacesContainingLatLng.length) {
  //   if (idsOfPlacesContainingLatLng.length === 1) {
  //     const place_id = idsOfPlacesContainingLatLng[0]
  //     // 3.2.1: assign to place
  //     db.occurrences.update({
  //       where: { occurrence_id: occurrenceId },
  //       data: { place_id, not_to_assign: false },
  //     })
  //   }
  //   // TODO: multiple places cover the drop point
  //   // TODO: need to ask user to choose
  //   // open dialog in middle of screen / map or at dragend position?
  // }
}