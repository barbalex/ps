import { useEffect, memo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAtom } from 'jotai'

import { addOpenNodes } from '../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../store.ts'

// ensure all parts of urlPath are included in openNodes
export const TreeOpenNodesSetter = memo(() => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const { pathname } = useLocation()
  const urlPath = pathname.split('/').filter((p) => p !== '')

  // console.log('hello TreeOpenNodesSetter, openNodes:', openNodes)

  // this component ensures that when navigating the node corresponding to the url and it's parents are opened
  // closing of nodes happens when the tree button is clicked
  useEffect(() => {
    const go = async () => {
      // create a list of arrays composed of all parts of urlPath
      const nodes = urlPath.reduce((acc, _, i) => {
        const node = urlPath.slice(0, i + 1)
        return [...acc, node]
      }, [])

      // addOpenNodes ensures only missing nodes are added
      await addOpenNodes({ nodes })
    }

    go()
  }, [openNodes, urlPath])

  return null
})
