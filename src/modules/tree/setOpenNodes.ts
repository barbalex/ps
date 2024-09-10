// seems not in use
// BEWARE: uses obsolete app_states table
// If reactivate, use atom store instead
import { isNodeOpen } from './isNodeOpen.ts'

export const setOpenNodes = async ({
  nodes = [],
  treeOpenNodes,
  setTreeOpenNodes,
}): void => {
  // ensure contained arrays are unique
  const newNodes = [...new Set(nodes)]
  // ensure only not yet open nodes are added
  const newNodesToAdd = newNodes.filter(
    (node) => !isNodeOpen({ node, openNodes: treeOpenNodes }),
  )

  // console.log('hello setOpenNodes', { nodes, newNodes })
  return setTreeOpenNodes(newNodesToAdd)
}
