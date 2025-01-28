import isEqual from 'lodash/isEqual'

interface Props {
  node: string[]
  openNodes: string[][]
}

export const isNodeOpen = ({ node = [], openNodes = [] }): boolean =>
  openNodes.some((n) => isEqual(n, node))
