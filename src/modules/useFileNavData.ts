import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId?: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  actionId?: string
  checkId?: string
  fileId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useFileNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  checkId,
  fileId,
}: Props) => {
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

  const nav: NavData | undefined = res?.rows?.[0]

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

  const navData = {
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

  return { loading, navData }
}
