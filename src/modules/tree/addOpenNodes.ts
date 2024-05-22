import { Electric } from '../../generated/client/index.ts'

interface Props {
  nodes: string[]
  db: Electric
  userEmail: string
}

export const addOpenNodes = async ({
  nodes = [],
  db,
  userEmail,
}: Props): void => {
  const appState = await db.app_states.findFirst({
    where: { user_email: userEmail },
  })
  const existingNodes = appState?.tree_open_nodes || []
  // ensure contained arrays are unique
  const newNodes = Array.from(new Set([...existingNodes, ...nodes]))

  return await db.app_states.update({
    where: { user_email: userEmail },
    data: { tree_open_nodes: newNodes },
  })
}
