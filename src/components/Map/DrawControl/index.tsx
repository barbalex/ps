import { useLocation } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { DrawControlComponent } from './DrawControl.tsx'
import {
  editingPlaceGeometryAtom,
  editingCheckGeometryAtom,
  editingActionGeometryAtom,
} from '../../../store.ts'

// need to decide whether to show the draw control
// show it if:
// - the active table is places AND editingPlaceGeometry is the id of the active place
// - the active table is checks AND editingCheckGeometry is the id of the active check
// - the active table is actions AND editingActionGeometry is the id of the active action
// - maybe later more cases
export const DrawControl = () => {
  const [editingPlaceGeometry] = useAtom(editingPlaceGeometryAtom)
  const [editingCheckGeometry] = useAtom(editingCheckGeometryAtom)
  const [editingActionGeometry] = useAtom(editingActionGeometryAtom)

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
