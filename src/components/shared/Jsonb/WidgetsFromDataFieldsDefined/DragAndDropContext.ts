import { createContext } from 'react'

import type { ItemEntry } from '../../../shared/DragAndDrop/index.tsx'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'

type CleanupFn = () => void
type DragAndDropContextValue = {
  getListLength: () => number
  registerItem: (entry: ItemEntry) => CleanupFn
  reorderItem: (args: {
    startIndex: number
    indexOfTarget: number
    closestEdgeOfTarget: Edge | null
  }) => void
  instanceId: symbol
}

export const DragAndDropContext = createContext<DragAndDropContextValue | null>(null)
