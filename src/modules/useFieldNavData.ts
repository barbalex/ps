import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

export const useFieldNavData = ({ projectId, fieldId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        field_id AS id,
        label
      FROM fields
      WHERE 
        project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}
        AND field_id = $1
    `,
    [fieldId],
  )

  const loading = res === undefined

  const nav = res?.rows?.[0]

  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : []),
    'fields',
  ]
  const ownArray = [...parentArray, nav?.id]
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`

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
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: 'Field',
  }

  return { loading, navData }
}
