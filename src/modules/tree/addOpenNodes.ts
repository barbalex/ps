import { isNodeOpen } from './isNodeOpen.ts'
import { treeOpenNodesAtom, store } from '../../store.ts'

interface Props {
  nodes: string[]
}

export const addOpenNodes = async ({ nodes = [] }: Props): void => {
  if (!nodes.length) return

  const openNodes = store.get(treeOpenNodesAtom)
  const nodesToAdd = nodes.filter((node) => !isNodeOpen({ node, openNodes }))
  if (!nodesToAdd.length) return

  const newNodes = [...openNodes, ...nodesToAdd]

  store.set(treeOpenNodesAtom, newNodes)
}
