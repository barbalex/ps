import { isEqual } from 'es-toolkit'

export const isStartOf = ({ node = [], otherNode = [] }) => {
  if (node.length > otherNode.length) return false

  return isEqual(node, otherNode.slice(0, node.length))
}
