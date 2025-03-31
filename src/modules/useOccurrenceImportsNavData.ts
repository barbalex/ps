import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { formatNumber } from './formatNumber.ts'
import { treeOpenNodesAtom } from '../store.ts'

export const useOccurrenceImportsNavData = ({ projectId, subprojectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        occurrence_import_id AS id,
        label 
      FROM occurrence_imports 
      WHERE subproject_id = $1 
      ORDER BY label`,
    [subprojectId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'occurrence-imports']
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
      toParams: {},
      label: `Occurrence Imports (${
        loading ? '...' : formatNumber(navs.length)
      })`,
      nameSingular: 'Occurrence Import',
      navs,
    }
  }, [
    loading,
    location.pathname,
    openNodes,
    projectId,
    res?.rows,
    subprojectId,
  ])

  return { loading, navData }
}
