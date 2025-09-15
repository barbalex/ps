// seems not in use
import { isEqual } from 'es-toolkit'

export const removeOpenNodes = async ({
  nodes = [],
  treeOpenNodes,
  setTreeOpenNodes,
}): void => {
  const newNodes = treeOpenNodes.filter((node) => !isEqual(node, nodes))

  return setTreeOpenNodes(newNodes)
}
