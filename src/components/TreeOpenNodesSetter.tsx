import { useEffect, memo } from 'react'
import { useCorbado } from '@corbado/react'
import { useLocation } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useAtom } from 'jotai'

import { useElectric } from '../ElectricProvider.tsx'
import { addOpenNodes } from '../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../store.ts'

// ensure all parts of urlPath are included in openNodes
export const TreeOpenNodesSetter = memo(() => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const { db } = useElectric()!
  const { user: authUser } = useCorbado()
  const { pathname } = useLocation()
  const urlPath = pathname.split('/').filter((p) => p !== '')

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )

  // console.log('hello TreeOpenNodesSetter, openNodes:', openNodes)

  // this component ensures that when navigating the node corresponding to the url and it's parents are opened
  // closing of nodes happens when the tree button is clicked
  useEffect(() => {
    const go = async () => {
      if (!appState?.app_state_id) return
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
})
