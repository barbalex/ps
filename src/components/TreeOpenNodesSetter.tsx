import { useEffect, useRef } from 'react'
import { useCorbado } from '@corbado/react'
import { useLocation } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'

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
  console.log('hello TreeOpenNodesSetter', {
    urlPath,
    previousUrlPath,
  })

  // when urlPath changes, update app_states.tree_open_nodes
  useEffect(() => {
    const go = async () => {
      // TODO:
    }

    go()
  }, [authUser?.email, db])

  return null
}
