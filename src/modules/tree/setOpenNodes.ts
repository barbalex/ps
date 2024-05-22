import { Electric } from '../../generated/client/index.ts'

interface Props {
  nodes: string[]
  db: Electric
  userEmail: string
}

export const setOpenNodes = async ({
  nodes = [],
  db,
  userEmail,
}: Props): void => {
  // ensure contained arrays are unique
  const newNodes = Array.from(new Set(nodes))

  return await db.app_states.update({
    where: { user_email: userEmail },
    data: { tree_open_nodes: newNodes },
  })
}
