import { isEqual } from 'es-toolkit'

interface Props {
  node: string[]
  otherNode: string[]
}

export const isStartOf = ({ node = [], otherNode = [] }) => {
  if (node.length > otherNode.length) return false

  return isEqual(node, otherNode.slice(0, node.length))
}
