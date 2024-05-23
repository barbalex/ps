import { Electric } from '../../generated/client/index.ts'
import { isNodeOpen } from './isNodeOpen.ts'

interface Props {
  nodes: string[]
  db: Electric
  appStateId: string
}

export const addOpenNodes = async ({
  nodes = [],
  db,
  appStateId,
}: Props): void => {
  if (!appStateId) throw new Error('appStateId is required')
  if (!db) throw new Error('db is required')
  if (!nodes.length) return

  const appState = await db.app_states.findFirst({
    where: { app_state_id: appStateId },
  })
  const openNodes = appState?.tree_open_nodes ?? []

  const nodesToAdd = nodes.filter((node) => !isNodeOpen({ node, openNodes }))
  if (!nodesToAdd.length) return

  const newNodes = [...openNodes, ...nodesToAdd]

  // console.log('hello addOpenNodes', {
  //   openNodes,
  //   newNodes,
  //   nodes,
  //   nodesToAdd,
  // })

  return await db.app_states.update({
    where: { app_state_id: appStateId },
    data: { tree_open_nodes: newNodes },
  })
}
