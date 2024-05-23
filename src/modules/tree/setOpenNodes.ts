import { Electric } from '../../generated/client/index.ts'
import { isNodeOpen } from './isNodeOpen.ts'

interface Props {
  nodes: string[]
  db: Electric
  appStateId: string
}

export const setOpenNodes = async ({
  nodes = [],
  db,
  appStateId,
}: Props): void => {
  // ensure contained arrays are unique
  const newNodes = [...new Set(nodes)]
  // ensure only not yet open nodes are added
  const newNodesToAdd = newNodes.filter(
    (node) => !isNodeOpen({ node, openNodes }),
  )

  // console.log('hello setOpenNodes', { nodes, newNodes })

  return await db.app_states.update({
    where: { app_state_id: appStateId },
    data: { tree_open_nodes: newNodesToAdd },
  })
}
