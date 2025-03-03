import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'

export type ItemEntry = { itemId: string; element: HTMLElement }

export function getItemRegistry() {
  const registry = new Map<string, HTMLElement>()

  function register({ itemId, element }: ItemEntry) {
    registry.set(itemId, element)

    return function unregister() {
      registry.delete(itemId)
    }
  }

  function getElement(itemId: string): HTMLElement | null {
    return registry.get(itemId) ?? null
  }

  return { register, getElement }
}

export type ReorderItemProps = {
  startIndex: number
  indexOfTarget: number
  closestEdgeOfTarget: Edge | null
}

export type DraggableState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | { type: 'dragging' }

export const idleState: DraggableState = { type: 'idle' }
export const draggingState: DraggableState = { type: 'dragging' }
