import { useLocation } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../../ElectricProvider'
import { DrawControlComponent } from './DrawControl'

// need to decide whether to show the draw control
// show it if:
// - the active table is places AND app_states.editing_place_geometry is the id of the active place
// - the active table is checks AND app_states.editing_check_geometry is the id of the active check
// - the active table is actions AND app_states.editing_action_geometry is the id of the active action
// - maybe later more cases
export const DrawControl = () => {
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser.email } }),
  )
  const editingPlaceGeometry = appState?.editing_place_geometry ?? null
  const editingCheckGeometry = appState?.editing_check_geometry ?? null
  const editingActionGeometry = appState?.editing_action_geometry ?? null

  const pathArray = useLocation()
    .pathname.split('/')
    .filter((p) => !!p)

  const lastPathElement = pathArray.at(-1)

  if (!lastPathElement) return null

  if (lastPathElement === editingPlaceGeometry) {
    return <DrawControlComponent editingPlace={editingPlaceGeometry} />
  }

  if (lastPathElement === editingCheckGeometry) {
    return <DrawControlComponent editingCheck={editingCheckGeometry} />
  }

  if (lastPathElement === editingActionGeometry) {
    return <DrawControlComponent editingAction={editingActionGeometry} />
  }

  return null
}
