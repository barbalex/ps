import isEqual from 'lodash/isEqual'

import { Electric } from '../../generated/client/index.ts'
import { isStartOf } from './isStartOf.ts'

interface Props {
  nodes: string[]
  db: Electric
  appStateId: string
}

export const removeChildNodes = async ({
  node = [],
  db,
  appStateId,
  isRoot = false,
}: Props): void => {
  const appState = await db.app_states.findFirst({
    where: { app_state_id: appStateId },
  })
  const openNodes = appState?.tree_open_nodes || []

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

  return await db.app_states.update({
    where: { app_state_id: appStateId },
    data: { tree_open_nodes: newNodes },
  })
}
