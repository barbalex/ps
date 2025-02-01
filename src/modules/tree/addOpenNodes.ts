import { isNodeOpen } from './isNodeOpen.ts'
import { treeOpenNodesAtom, store } from '../../store.ts'

interface Props {
  nodes: string[]
  setOpenNodes: (value: string[]) => void
}

export const addOpenNodes = ({ nodes = [] }: Props): void => {
  if (!nodes.length) return

  const openNodes = store.get(treeOpenNodesAtom)
  const nodesToAdd = nodes.filter((node) => !isNodeOpen({ node, openNodes }))
  if (!nodesToAdd.length) return

  store.set(treeOpenNodesAtom, (openNodes) => [...openNodes, ...nodesToAdd])
}
