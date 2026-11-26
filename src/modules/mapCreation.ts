import { atom } from 'jotai'

import {
  choosingGeometryAtom,
  editingActionGeometryAtom,
  editingCheckGeometryAtom,
  editingPlaceGeometryAtom,
  mapInfoAtom,
} from '../store.ts'

export type MapCreation = {
  table: 'place' | 'check' | 'action'
  level: number
  projectId: string
  subprojectId: string
  placeId: string | null
  layerLabel: string
}

const draftAtom = atom<MapCreation | null>(null)
export const mapCreationAtom = atom(
  (get) => get(draftAtom),
  (_get, set, draft: MapCreation | null) => {
    if (draft) {
      set(choosingGeometryAtom, false)
      set(editingPlaceGeometryAtom, null)
      set(editingCheckGeometryAtom, null)
      set(editingActionGeometryAtom, null)
      set(mapInfoAtom, null)
    }
    set(draftAtom, draft)
  },
)
