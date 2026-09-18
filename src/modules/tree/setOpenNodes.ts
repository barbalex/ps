// seems not in use
import { isNodeOpen } from './isNodeOpen.ts'

export const setOpenNodes = async ({
  nodes = [],
  treeOpenNodes,
  setTreeOpenNodes,
}: {
  nodes?: string[][]
  treeOpenNodes: string[][]
  setTreeOpenNodes: (nodes: string[][]) => void
}): Promise<void> => {
  // ensure contained arrays are unique
  const newNodes = [...new Set(nodes)]
  // ensure only not yet open nodes are added
  const newNodesToAdd = newNodes.filter(
    (node) => !isNodeOpen({ node, openNodes: treeOpenNodes }),
  )

  // console.log('hello setOpenNodes', { nodes, newNodes })
  return setTreeOpenNodes(newNodesToAdd)
}
