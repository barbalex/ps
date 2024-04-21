import {
  Electric,
  Vector_layers as VectorLayer,
} from '../../../generated/client'

interface Props {
  db: Electric
  authUser: { email: string }
  layer: VectorLayer
  latLng: [number, number]
}

export const assignToNearestDroppable = ({ db, authUser, layer, latLng }) => {
  // 1. get droppable layer
  const appState = db.app_states.liveFirst({
    where: { user_email: authUser?.email },
  })
  const droppableLayer = appState?.droppable_layer
}
