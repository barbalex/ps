import { useLocation } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { DrawControlComponent } from './DrawControl'
import { user_id } from '../../SqlInitializer'

// need to decide whether to show the draw control
// show it if:
// - the active table is places AND ui_options.editing_place_geometry is the id of the active place
// - the active table is checks AND ui_options.editing_check_geometry is the id of the active ckeck
// - the active table is actions AND ui_options.editing_action_geometry is the id of the active action
// - maybe later more cases
export const DrawControl = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const editingPlaceGeometry = uiOption?.editing_place_geometry ?? null
  const editingCheckGeometry = uiOption?.editing_check_geometry ?? null
  const editingActionGeometry = uiOption?.editing_action_geometry ?? null

  const pathArray = useLocation()
    .pathname.split('/')
    .filter((p) => !!p)

  const lastPathElement = pathArray.at(-1)
  if (!lastPathElement) return null

  if (lastPathElement === editingPlaceGeometry)
    return <DrawControlComponent editingPlace={editingPlaceGeometry} />

  if (lastPathElement === editingCheckGeometry)
    return <DrawControlComponent editingCheck={editingCheckGeometry} />

  if (lastPathElement === editingActionGeometry)
    return <DrawControlComponent editingAction={editingActionGeometry} />

  return null
}
