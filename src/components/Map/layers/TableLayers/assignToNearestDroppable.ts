import { pointsWithinPolygon } from '@turf/points-within-polygon' // https://turfjs.org/docs/#pointsWithinPolygon
import { convex } from '@turf/convex' // https://turfjs.org/docs/#convex
import { polygonToLine } from '@turf/polygon-to-line' // https://turfjs.org/docs/#polygonToLine
import { pointToLineDistance } from '@turf/point-to-line-distance'
import { distance } from '@turf/distance'
import { buffer } from '@turf/buffer'
import { point, points } from '@turf/helpers'

import {
  addOperationAtom,
  addNotificationAtom,
  store,
  pgliteDbAtom,
} from '../../../../store.ts'
import { resetObservationMarkerPosition } from './observationMarkers.ts'

export const assignToNearestDroppable = async ({
  latLng,
  observationId,
  map,
  droppableLayers,
  confirmAssigningToSingleTarget,
  setPlacesToAssignObservationTo,
}) => {
  const db = store.get(pgliteDbAtom)
  let latLngPoint
  try {
    latLngPoint = point([latLng.lng, latLng.lat])
  } catch (error) {
    console.log('hello assignToNearestDroppable', { error })
  }
  let latLngPoints
  try {
    latLngPoints = points([[latLng.lng, latLng.lat]])
  } catch (error) {
    console.log('hello assignToNearestDroppable', { error })
  }
  // TODO: best would be to query using PostGIS functions...
  // 1. get all features from droppable layers
  // Build WHERE clause based on which place levels are droppable
  const includePlaces1 = droppableLayers.some(
    (layer) => layer.includes('places') && layer.includes('1'),
  )
  const includePlaces2 = droppableLayers.some(
    (layer) => layer.includes('places') && layer.includes('2'),
  )

  let whereClause = 'geometry IS NOT NULL'
  if (includePlaces1 && !includePlaces2) {
    whereClause += ' AND parent_id IS NULL'
  } else if (includePlaces2 && !includePlaces1) {
    whereClause += ' AND parent_id IS NOT NULL'
  }
  // If both or neither are included, we don't filter by parent_id

  const placesRes = await db.query(`SELECT * FROM places WHERE ${whereClause}`)
  const places = placesRes?.rows ?? []

  // 2. get the nearest feature

  // 2.1 direct using nearestPoint
  //     does not work because of the error: coord must be GeoJSON Point or an Array of numbers

  // 2.2 find out if the latLng is inside a feature: https://turfjs.org/docs/#pointsWithinPolygon
  //     Because of featureCollection, use the convex hull: https://turfjs.org/docs/#convex
  const idsOfPlacesContainingLatLng = []
  for (const place of places) {
    // console.log(
    //   'hello assignToNearestDroppable distance 1, place label:',
    //   place.label,
    // )
    // console.log(
    //   'hello assignToNearestDroppable distance 2, geometry:',
    //   place.geometry,
    // )
    // TODO: convexed only works for polygons
    // so buffer the geometry by a small value first
    let bufferedGeometry
    try {
      bufferedGeometry = buffer(place.geometry, 0.000001)
    } catch (error) {
      console.log('hello assignToNearestDroppable 3', { error })
    }
    let convexedGeometry
    try {
      convexedGeometry = convex(bufferedGeometry)
    } catch (error) {
      console.log('hello assignToNearestDroppable 5', { error })
    }
    let pointsWithin
    try {
      pointsWithin = pointsWithinPolygon(latLngPoints, convexedGeometry)
    } catch (error) {
      // an error occurs if geometry is not polygon, so ignore
      console.log('hello assignToNearestDroppable 6', { error })
    }
    const isInside = pointsWithin?.features?.length > 0
    // if isInside, assign, then return
    if (!isInside) continue
    idsOfPlacesContainingLatLng.push(place.place_id)
  }

  // 2.3 if not, find the nearest feature
  // 2.3.1: find nearest center of mass? https://turfjs.org/docs/#centerOfMass, https://turfjs.org/docs/#nearestPoint
  // 2.3.2: better but more work:
  //        create convex outline of all places (https://turfjs.org/docs/#convex),
  //        convert that to a line (https://turfjs.org/docs/#polygonToLine),
  //        for every observation find nearest outline (https://turfjs.org/docs/#pointToLineDistance)
  //        choose closest
  //        ISSUE: convex does not work for points are straight lines (https://github.com/Turfjs/turf/issues/2449)
  //        Solution: buffer the feature collection by a millimetre before convexing
  //        alternative solution: https://github.com/Turfjs/turf/issues/1743
  const placeIdsWithDistance = places.map((place) => {
    const placeContainsObservation = idsOfPlacesContainingLatLng.includes(
      place.place_id,
    )
    if (placeContainsObservation) {
      return { place_id: place.place_id, distance: 0 }
    }

    let bufferedGeometry
    try {
      bufferedGeometry = buffer(place.geometry, 0.000001)
    } catch (error) {
      console.log('hello assignToNearestDroppable 8', { error })
    }
    let convexedGeometry
    try {
      convexedGeometry = convex(bufferedGeometry)
    } catch (error) {
      console.log('hello assignToNearestDroppable 10', { error })
    }
    let hullLine
    try {
      hullLine = polygonToLine(convexedGeometry)
    } catch (error) {
      console.log('hello assignToNearestDroppable distance 12', { error })
    }
    let distance
    try {
      distance = pointToLineDistance(latLngPoint, hullLine)
    } catch (error) {
      console.log('hello assignToNearestDroppable distance 14', { error })
    }
    return { place_id: place.place_id, distance }
  })
  // get width of map in kilometres
  const mapBounds = map.getBounds()
  const mapNorthEast = mapBounds.getNorthEast()
  const mapNorthWest = mapBounds.getNorthWest()
  const mapWidth = distance(
    point([mapNorthEast.lng, mapNorthEast.lat]),
    point([mapNorthWest.lng, mapNorthWest.lat]),
  )

  // Calculate distance for 40 pixels
  const mapWidthInPixels = map.getSize().x
  const kmPerPixel = mapWidth / mapWidthInPixels
  const minDistance = kmPerPixel * 40

  const placeIdsWithMinDistances = placeIdsWithDistance.filter(
    (d) => d.distance < minDistance,
  )
  // sort by distance
  const placeIdsWithMinDistancesSortedByDistance = [...placeIdsWithMinDistances]
    .sort((a, b) => a.distance - b.distance)
    // and take the first 5
    .slice(0, 5)

  // console.log('hello assignToNearestDroppable distance 14', {
  //   mapWidth,
  //   minDistance,
  //   placeIdsWithMinDistances,
  //   placeIdsWithDistance,
  //   placeIdsWithMinDistancesSortedByDistance,
  // })

  // Query current assignment to pass to dialog
  const observationRes = await db.query(
    `SELECT place_id FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const currentPlaceId = observationRes?.rows?.[0]?.place_id

  if (!placeIdsWithMinDistancesSortedByDistance.length) {
    // Show dialog to inform user no place found within 20px
    const placesToAssignObservationTo = {
      observation_id: observationId,
      latLng,
      places: [],
      current_place_id: currentPlaceId,
    }
    setPlacesToAssignObservationTo(placesToAssignObservationTo)
    return
  }

  // TODO: really? Maybe better to always confirm?
  if (
    placeIdsWithMinDistancesSortedByDistance.length === 1 &&
    !confirmAssigningToSingleTarget
  ) {
    const place_id = placeIdsWithMinDistancesSortedByDistance[0]?.place_id
    // 3.2.1: assign to place
    await db.query(
      `UPDATE observations SET place_id = $1, not_to_assign = $2 WHERE observation_id = $3`,
      [place_id, null, observationId],
    )
    // query observation to pass it as prev value
    const observationRes = await db.query(
      `SELECT * FROM observations WHERE observation_id = $1`,
      [observationId],
    )
    const prev = observationRes?.rows?.[0] ?? {}
    store.set(addOperationAtom, {
      table: 'observations',
      rowIdName: 'observation_id',
      rowId: observationId,
      operation: 'update',
      draft: { place_id, not_to_assign: null },
      prev,
    })

    // Reset marker to original position
    resetObservationMarkerPosition(observationId)

    return
  }

  // ask user to choose
  const placesToAssignObservationTo = {
    observation_id: observationId,
    latLng,
    places: placeIdsWithMinDistancesSortedByDistance.map((p) => ({
      ...p,
      label: places.find((place) => place.place_id === p.place_id)?.label,
    })),
    current_place_id: currentPlaceId,
  }
  setPlacesToAssignObservationTo(placesToAssignObservationTo)
}
