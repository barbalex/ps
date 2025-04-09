import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

export const useProjectUserNavData = ({ projectId, projectUserId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    SELECT
      project_user_id AS id,
      label
    FROM project_users 
    WHERE project_user_id = $1`,
    [projectUserId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]
    const parentArray = ['data', 'projects', projectId, 'users']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, projectUserId]
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label: nav?.label ?? nav?.id,
      nameSingular: 'Project User',
    }
  }, [location.pathname, openNodes, projectId, projectUserId, res?.rows])

  return { loading, navData }
}
