import { useEffect, useRef, useMemo } from 'react'
import { useCorbado } from '@corbado/react'
import { useLocation } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../ElectricProvider.tsx'
import { addOpenNodes } from '../modules/tree/addOpenNodes.ts'
import { removeOpenNodes } from '../modules/tree/removeOpenNodes.ts'
import { isNodeOpen } from '../modules/tree/isNodeOpen.ts'
import { setOpenNodes } from '../modules/tree/setOpenNodes.ts'
import { isStartOf } from '../modules/tree/isStartOf.ts'

// function usePrevious(value) {
//   const ref = useRef()
//   useEffect(() => {
//     ref.current = value
//   })

//   return ref.current
// }

// ensure all parts of urlPath are included in openNodes
export const TreeOpenNodesSetter = () => {
  const { db } = useElectric()!
  const { user: authUser } = useCorbado()
  const { pathname } = useLocation()
  const urlPath = pathname.split('/').filter((p) => p !== '')
  // const previousUrlPath = usePrevious(urlPath)

  // fetch app_states.tree_open_nodes
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )
  const openNodes = useMemo(
    () => appState?.tree_open_nodes ?? [],
    [appState?.tree_open_nodes],
  )
  console.log('hello TreeOpenNodesSetter, openNodes:', openNodes)

  // when urlPath changes, update app_states.tree_open_nodes
  // TODO: this component ensures that when navigating the node corresponding to the url and it's parents are opened
  // TODO: closing happens when the tree button is clicked
  useEffect(() => {
    const go = async () => {
      // create a list of arrays composed of all parts of urlPath
      const nodes = urlPath.reduce((acc, _, i) => {
        const node = urlPath.slice(0, i + 1)
        return [...acc, node]
      }, [])

      // addOpenNodes ensures only missing nodes are added
      await addOpenNodes({
        nodes,
        db,
        appStateId: appState?.app_state_id,
      })
      // TODO: integrate this in tree Button
      // if (isStartOf({ node: urlPath, otherNode: previousUrlPath })) {
      //   // remove all nodes longer than urlPath
      //   const newOpenNodes = openNodes.filter(
      //     (node) => !isStartOf({ node: urlPath, otherNode: node }),
      //   )
      //   return setOpenNodes({
      //     nodes: newOpenNodes,
      //     db,
      //     userEmail: authUser!.email,
      //   })
      // }
    }

    go()
  }, [
    appState?.app_state_id,
    authUser,
    authUser?.email,
    db,
    openNodes,
    urlPath,
  ])

  return null
}
