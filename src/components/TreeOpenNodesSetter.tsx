import { useEffect, useRef } from 'react'
import { useCorbado } from '@corbado/react'
import { useLocation } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../ElectricProvider.tsx'
import { addOpenNodes } from '../modules/tree/addOpenNodes.ts'
import { removeOpenNodes } from '../modules/tree/removeOpenNodes.ts'
import { isNodeOpen } from '../modules/tree/isNodeOpen.ts'
import { setOpenNodes } from '../modules/tree/setOpenNodes.ts'
import { isStartOf } from '../modules/tree/isStartOf.ts'

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

export const TreeOpenNodesSetter = () => {
  const { db } = useElectric()!
  const { user: authUser } = useCorbado()
  const { pathname } = useLocation()
  const urlPath = pathname.split('/').filter((p) => p !== '')
  const previousUrlPath = usePrevious(urlPath)

  // fetch app_states.tree_open_nodes
  const appState = useLiveQuery(() =>
    db.app_states.findFirst({
      where: { user_email: authUser!.email },
    }),
  )
  const openNodes = appState?.tree_open_nodes || []
  console.log('hello TreeOpenNodesSetter', {
    urlPath,
    previousUrlPath,
  })

  // when urlPath changes, update app_states.tree_open_nodes
  useEffect(() => {
    const go = async () => {
      // TODO:
      // 1. user closed a node: urlPath is included in previousUrlPath (previousUrlPath is longer)
      if (isStartOf({ node: urlPath, otherNode: previousUrlPath })) {
        // remove all nodes longer than urlPath
        const newOpenNodes = openNodes.filter(
          (node) => !isStartOf({ node: urlPath, otherNode: node }),
        )
        return setOpenNodes({
          nodes: newOpenNodes,
          db,
          userEmail: authUser!.email,
        })
      }
      // 2. user opened a node: previousUrlPath is not included in urlPath
      // if previousUrlPath is shorter than urlPath, remove the difference
      // if previousUrlPath is longer than urlPath, add the difference
      // if previousUrlPath is different than urlPath, remove previousUrlPath and add urlPath
    }

    go()
  }, [authUser?.email, db, urlPath])

  return null
}
