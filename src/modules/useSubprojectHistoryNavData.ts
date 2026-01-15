import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  year: string
}

type NavData = {
  id: string
  label: string | null
}

export const useSubprojectHistoryNavData = ({
  projectId,
  subprojectId,
  year,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    SELECT 
      year::text AS id, 
      label 
    FROM subproject_histories
    WHERE subproject_id = $1 AND year = $2`,
    [subprojectId, parseInt(year)],
  )
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'histories']
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 5,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: 'Subproject History',
  }

  return { loading, navData }
}
