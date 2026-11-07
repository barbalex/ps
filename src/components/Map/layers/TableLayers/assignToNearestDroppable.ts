import { distance } from '@turf/distance'
import { point } from '@turf/helpers'
import type { Map, LatLng } from 'leaflet'

import {
  addOperationAtom,
  store,
  pgliteDbAtom,
} from '../../../../store.ts'
import type { PlacesToAssignObservationTo } from '../../../../store.ts'
import { nearestPlaces } from '../../../../modules/geoQueries.ts'
import { resetObservationMarkerPosition } from './observationMarkers.ts'

export const assignToNearestDroppable = async ({
  latLng,
  observationId,
  map,
  droppableLayers,
  confirmAssigningToSingleTarget,
  setPlacesToAssignObservationTo,
}: {
  latLng: LatLng
  observationId: string
  map: Map
  droppableLayers: string[]
  confirmAssigningToSingleTarget: boolean
  setPlacesToAssignObservationTo: (value: PlacesToAssignObservationTo) => void
}) => {
  const db = store.get(pgliteDbAtom)!

  // 1. determine which place levels are droppable
  const includePlaces1 = droppableLayers.some(
    (layer) => layer.includes('places') && layer.includes('1'),
  )
  const includePlaces2 = droppableLayers.some(
    (layer) => layer.includes('places') && layer.includes('2'),
  )
  const level =
    includePlaces1 && !includePlaces2
      ? ('places1' as const)
      : includePlaces2 && !includePlaces1
        ? ('places2' as const)
        : ('both' as const)

  // 2. get width of map in kilometres to calculate the max distance
  const mapBounds = map.getBounds()
  const mapNorthEast = mapBounds.getNorthEast()
  const mapNorthWest = mapBounds.getNorthWest()
  const mapWidth = distance(
    point([mapNorthEast.lng, mapNorthEast.lat]),
    point([mapNorthWest.lng, mapNorthWest.lat]),
  )

  // Calculate max distance for 40 pixels, in meters
  const mapWidthInPixels = map.getSize().x
  const kmPerPixel = mapWidth / mapWidthInPixels
  const maxDistanceM = kmPerPixel * 40 * 1000

  // 3. get the nearest places via PostGIS:
  //    containing place => distance 0, otherwise distance in meters
  //    to the nearest geometry member
  const places = await nearestPlaces(db, {
    lng: latLng.lng,
    lat: latLng.lat,
    maxDistanceM,
    level,
    limit: 5,
  })

  // Query current assignment to pass to dialog
  const observationRes = await db.query(
    `SELECT place_id FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const currentPlaceId = (observationRes?.rows?.[0] as
    | { place_id: string | null }
    | undefined)?.place_id as string | null

  if (!places.length) {
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
  if (places.length === 1 && !confirmAssigningToSingleTarget) {
    const place_id = places[0]?.place_id
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
    const prev = (observationRes?.rows?.[0] ?? {}) as Record<string, unknown>
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
    places: places.map((place) => ({
      place_id: place.place_id,
      label: place.label,
      distance: place.distance_m ?? 0,
    })),
    current_place_id: currentPlaceId,
  }
  setPlacesToAssignObservationTo(placesToAssignObservationTo)
}
