import { isNodeOpen } from './isNodeOpen.ts'
import { treeOpenNodesAtom, store } from '../../store.ts'

interface Props {
  nodes: string[][]
}

export const addOpenNodes = ({ nodes = [] }: Props): void => {
  if (!nodes.length) return

  // treeOpenNodesAtom is declared as string[] in store.ts but holds string[][]
  // node paths at runtime (see callers passing [ownArray])
  const openNodes = store.get(treeOpenNodesAtom) as unknown as string[][]
  const nodesToAdd = nodes.filter((node) => !isNodeOpen({ node, openNodes }))
  if (!nodesToAdd.length) return

  store.set(treeOpenNodesAtom, (openNodes) => [...openNodes, ...nodesToAdd])
}
