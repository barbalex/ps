import { useEffect, memo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAtom } from 'jotai'

import { addOpenNodes } from '../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../store.ts'

// ensure all parts of urlPath are included in openNodes
export const TreeOpenNodesSetter = memo(() => {
  const [openNodes, setOpenNodes] = useAtom(treeOpenNodesAtom)
  console.log('TreeOpenNodesSetter, openNodes:', openNodes)

  const location = useLocation()
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  console.log('TreeOpenNodesSetter, urlPath:', urlPath)

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

      console.log('TreeOpenNodesSetter, effect, nodes:', nodes)
      // addOpenNodes ensures only missing nodes are added
      addOpenNodes({ nodes, setOpenNodes })
    }

    go()
  }, [openNodes, location.pathname])

  return null
})
