import { createContext } from 'react'

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
