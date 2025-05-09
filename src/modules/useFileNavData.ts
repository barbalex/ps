import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

export const useFileNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  checkId,
  fileId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const isPreview = location.pathname.endsWith('/preview')

  const res = useLiveQuery(
    `
      SELECT
        file_id AS id,
        label
      FROM 
        files
      WHERE
        file_id = $1
    `,
    [fileId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]

    const parentArray = [
      'data',
      ...(projectId ? ['projects', projectId] : []),
      ...(subprojectId ? ['subprojects', subprojectId] : []),
      ...(placeId ? ['places', placeId] : []),
      ...(placeId2 ? ['places', placeId2] : []),
      ...(actionId ? ['actions', actionId] : []),
      ...(checkId ? ['checks', checkId] : []),
      'files',
    ]
    const ownArray = [...parentArray, fileId, ...(isPreview ? ['preview'] : [])]
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const parentUrl = `/${parentArray.join('/')}`
    const ownUrl = `/${ownArray.join('/')}`
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const notFound = !!res && !nav
    const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label,
      notFound,
      nameSingular: 'File',
    }
  }, [
    actionId,
    checkId,
    fileId,
    isPreview,
    location.pathname,
    openNodes,
    placeId,
    placeId2,
    projectId,
    res,
    subprojectId,
  ])

  return { loading, navData }
}
