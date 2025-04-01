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

  const parentArray = useMemo(
    () => ['data', 'projects', projectId],
    [projectId],
  )
  const ownArray = useMemo(() => [...parentArray, 'subprojects'], [parentArray])
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = useMemo(
    () => openNodes.some((array) => isEqual(array, ownArray)),
    [openNodes, ownArray],
  )

  const [filter] = useAtom(subprojectsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql =
    isOpen ?
      `
      WITH 
        count_unfiltered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT 
        sp.subproject_id AS id,
        sp.label, 
        p.subproject_name_plural, 
        p.subproject_name_singular,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM subprojects sp
        INNER JOIN projects p ON p.project_id = sp.project_id,
        count_unfiltered, count_filtered
      WHERE 
        p.project_id = '${projectId}'
        ${isFiltered ? ` AND ${filterString}` : ''} 
      ORDER BY label
    `
    : `
      WITH 
        count_unfiltered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ''} )
      SELECT 
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  console.log('useSubprojectsNavData sql', sql)
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs = useMemo(() => res?.rows ?? [], [res])
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0

  const namePlural = navs[0]?.subproject_name_plural ?? 'Subprojects'
  const nameSingular = navs[0]?.subproject_name_singular ?? 'Subproject'

  const navData = useMemo(() => {
    const parentUrl = `/${parentArray.join('/')}`
    const ownUrl = `/${ownArray.join('/')}`
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
      label: `${namePlural} (${
        isFiltered ?
          `${loading ? '...' : formatNumber(countFiltered)}/${
            loading ? '...' : formatNumber(countUnfiltered)
          }`
        : loading ? '...'
        : formatNumber(countFiltered)
      })`,
      nameSingular,
      navs,
    }
  }, [
    countFiltered,
    countUnfiltered,
    isFiltered,
    isOpen,
    loading,
    location.pathname,
    namePlural,
    nameSingular,
    navs,
    ownArray,
    parentArray,
  ])

  return { loading, navData, isFiltered }
}
