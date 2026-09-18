// seems not in use
import { isEqual } from 'es-toolkit'

export const removeOpenNodes = async ({
  nodes = [],
  treeOpenNodes,
  setTreeOpenNodes,
}: {
  nodes?: string[][]
  treeOpenNodes: string[][]
  setTreeOpenNodes: (nodes: string[][]) => void
}): Promise<void> => {
  const newNodes = treeOpenNodes.filter((node) => !isEqual(node, nodes))

  return setTreeOpenNodes(newNodes)
}
