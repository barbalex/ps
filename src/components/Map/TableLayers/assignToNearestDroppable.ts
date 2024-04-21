import nearestPoint from '@turf/nearest-point'
import { featureCollection, point } from '@turf/helpers'

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

export const assignToNearestDroppable = ({
  db,
  authUser,
  layer,
  latLng,
}: Props) => {
  // 1. get droppable layer
  const appState = db.app_states.liveFirst({
    where: { user_email: authUser?.email },
  })
  const droppableLayer = appState?.droppable_layer
  // 2. get all features from droppable layer
  const places: Place[] = db.places.findMany({
    where: {
      parent_id: droppableLayer === 'places1' ? null : { not: null },
      geometry: { not: null },
    },
  })
}
