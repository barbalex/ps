import { isNodeOpen } from './isNodeOpen.ts'
import { treeOpenNodesAtom, store } from '../../store.ts'

interface Props {
  nodes: string[]
  setOpenNodes: (value: string[]) => void
}

export const addOpenNodes = ({ nodes = [] }: Props): void => {
  console.log('addOpenNodes 1, nodes passed in:', nodes)
  if (!nodes.length) return

  const openNodes = store.get(treeOpenNodesAtom)
  console.log('addOpenNodes 2, openNodes:', openNodes)
  const nodesToAdd = nodes.filter((node) => !isNodeOpen({ node, openNodes }))
  console.log('addOpenNodes 3, nodesToAdd:', nodesToAdd)
  if (!nodesToAdd.length) return

  const newNodes = [...openNodes, ...nodesToAdd]
  console.log('addOpenNodes 4, newNodes:', newNodes)

  store.set(treeOpenNodesAtom, (openNodes) => [...openNodes, ...nodesToAdd])
}
