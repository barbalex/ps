import isEqual from 'lodash/isEqual'

import { isStartOf } from './isStartOf.ts'
import { treeOpenNodesAtom, store } from '../../store.ts'

interface Props {
  nodes: string[]
  isRoot: boolean
}

export const removeChildNodes = async ({
  node = [],
  isRoot = false,
}: Props): void => {
  store.set(treeOpenNodesAtom, (openNodes) => {
    // remove all nodes that are children of the node
    const newNodes = openNodes.filter((openNode) => {
      if (isRoot) {
        // if is root, need to remove root as well
        return !isStartOf({ node, otherNode: openNode })
      }
      // if openNode isn't longer than node, it can't be a child
      if (openNode.length <= node.length) return true
      // check if openNode is a child of node i.e. if it starts with node
      return !isEqual(openNode.slice(0, node.length), node)
    })

    return newNodes
  })
}
