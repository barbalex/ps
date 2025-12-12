import { pointsWithinPolygon } from '@turf/points-within-polygon' // https://turfjs.org/docs/#pointsWithinPolygon
import { convex } from '@turf/convex' // https://turfjs.org/docs/#convex
import { polygonToLine } from '@turf/polygon-to-line' // https://turfjs.org/docs/#polygonToLine
import { pointToLineDistance } from '@turf/point-to-line-distance'
import { distance } from '@turf/distance'
import { buffer } from '@turf/buffer'
import { point, points } from '@turf/helpers'

import { createNotification } from '../../../../modules/createRows.ts'
import { addOperationAtom, store } from '../../../../store.ts'

export const assignToNearestDroppable = async ({
  db,
  latLng,
  occurrenceId,
  map,
  droppableLayer,
  confirmAssigningToSingleTarget,
  setPlacesToAssignOccurrenceTo,
}) => {
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
  // 1. get all features from droppable layer
  const placesRes = await db.query(
    `SELECT * FROM places WHERE geometry IS NOT NULL AND parent_id ${
      droppableLayer === 'places1' ? ' is null' : 'is not null'
    }`,
  )
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
  //        for every occurrence find nearest outline (https://turfjs.org/docs/#pointToLineDistance)
  //        choose closest
  //        ISSUE: convex does not work for points are straight lines (https://github.com/Turfjs/turf/issues/2449)
  //        Solution: buffer the feature collection by a millimetre before convexing
  //        alternative solution: https://github.com/Turfjs/turf/issues/1743
  const placeIdsWithDistance = places.map((place) => {
    const placeContainsOccurrence = idsOfPlacesContainingLatLng.includes(
      place.place_id,
    )
    if (placeContainsOccurrence) {
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

  const minDistance = mapWidth / 2
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

  if (!placeIdsWithMinDistancesSortedByDistance.length) {
    // tell user no place found to assign to
    createNotification({
      message: 'No place found to assign to',
      type: 'error',
      db,
    })
  }

  // TODO: really? Maybe better to always confirm?
  if (
    placeIdsWithMinDistancesSortedByDistance.length === 1 &&
    !confirmAssigningToSingleTarget
  ) {
    // console.log(
    //   'hello assignToNearestDroppable 15, assigning as single place found inside min distance',
    // )
    const place_id = placeIdsWithMinDistancesSortedByDistance[0]?.place_id
    // 3.2.1: assign to place
    db.query(
      `UPDATE occurrences SET place_id = $1, not_to_assign = $2 WHERE occurrence_id = $3`,
      [place_id, null, occurrenceId],
    )
    return
  }

  // ask user to choose
  const placesToAssignOccurrenceTo = {
    occurrence_id: occurrenceId,
    places: placeIdsWithMinDistancesSortedByDistance.map((p) => ({
      ...p,
      label: places.find((place) => place.place_id === p.place_id)?.label,
    })),
  }
  setPlacesToAssignOccurrenceTo(placesToAssignOccurrenceTo)
}
