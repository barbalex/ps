import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { formatNumber } from './formatNumber.ts'
import { subprojectsFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useSubprojectsNavData = ({ projectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(subprojectsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(
    `
    SELECT 
      sp.subproject_id AS id,
      sp.label, 
      p.subproject_name_plural, 
      p.subproject_name_singular
    FROM subprojects sp
      INNER JOIN projects p ON p.project_id = sp.project_id 
    WHERE 
      p.project_id = $1
      ${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY label
    `,
    [projectId],
  )

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM subprojects WHERE project_id = $1`,
    [projectId],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const navs = useMemo(() => res?.rows ?? [], [res])

  const namePlural = navs[0]?.subproject_name_plural ?? 'Subprojects'
  const nameSingular = navs[0]?.subproject_name_singular ?? 'Subproject'

  const navData = useMemo(() => {
    const parentArray = ['data', 'projects', projectId]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'subprojects']
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
      label: `${namePlural} (${
        isFiltered ?
          `${loading ? '...' : formatNumber(navs.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : loading ? '...'
        : formatNumber(navs.length)
      })`,
      nameSingular,
      navs,
    }
  }, [
    countLoading,
    countUnfiltered,
    isFiltered,
    loading,
    location.pathname,
    namePlural,
    nameSingular,
    navs,
    openNodes,
    projectId,
  ])

  return { loading, navData, isFiltered }
}
