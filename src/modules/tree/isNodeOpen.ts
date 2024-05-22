import isEqual from 'lodash/isEqual'

interface Props {
  node: string[]
  openNodes: string[][]
}

export const isNodeOpen = ({ node = [], openNodes = [] }: Props): boolean =>
  openNodes.some((n) => isEqual(n, node))
