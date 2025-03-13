import { useEffect, memo } from 'react'
import { useLocation } from '@tanstack/react-router'

import { addOpenNodes } from '../modules/tree/addOpenNodes.ts'

// ensure all parts of urlPath are included in openNodes
export const TreeOpenNodesSetter = memo(() => {
  const location = useLocation()
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  // this component ensures that when navigating the node corresponding to the url and it's parents are opened
  // closing of nodes happens when the tree button is clicked
  useEffect(() => {
    // create a list of arrays composed of all parts of urlPath
    const nodes = urlPath.reduce((acc, _, i) => {
      const node = urlPath.slice(0, i + 1)
      return [...acc, node]
    }, [])

    // addOpenNodes ensures only missing nodes are added
    addOpenNodes({ nodes })
  }, [location.pathname, urlPath])

  return null
})
