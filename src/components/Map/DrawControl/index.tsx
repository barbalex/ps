import { useLocation, useParams } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'

import { DrawControlComponent } from './DrawControl.tsx'
import { CreateOnMap } from './CreateOnMap.tsx'
import { mapCreationAtom } from '../../../modules/mapCreation.ts'
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
  const creation = useAtomValue(mapCreationAtom)
  const { projectId } = useParams({ strict: false })
  const editingPlaceGeometry = useAtomValue(editingPlaceGeometryAtom)
  const editingCheckGeometry = useAtomValue(editingCheckGeometryAtom)
  const editingActionGeometry = useAtomValue(editingActionGeometryAtom)

  const pathArray = useLocation()
    .pathname.split('/')
    .filter((p) => !!p)

  const lastTwoElements = pathArray.slice(-2).join('/')

  if (creation && creation.projectId === projectId) return <CreateOnMap draft={creation} />
  if (!lastTwoElements) return null

  const last = pathArray[pathArray.length - 1]
  const secondToLast = pathArray[pathArray.length - 2]

  if (
    lastTwoElements === `${editingPlaceGeometry}/place` ||
    (secondToLast === 'places' && last === editingPlaceGeometry)
  ) {
    return <DrawControlComponent key={`place/${editingPlaceGeometry}`} editingPlace={editingPlaceGeometry} />
  }

  if (
    lastTwoElements === `${editingCheckGeometry}/check` ||
    (secondToLast === 'checks' && last === editingCheckGeometry)
  ) {
    return <DrawControlComponent key={`check/${editingCheckGeometry}`} editingCheck={editingCheckGeometry} />
  }

  if (
    lastTwoElements === `${editingActionGeometry}/action` ||
    (secondToLast === 'actions' && last === editingActionGeometry)
  ) {
    return <DrawControlComponent key={`action/${editingActionGeometry}`} editingAction={editingActionGeometry} />
  }

  return null
}
