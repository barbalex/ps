import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { fieldsFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useFieldsNavData = ({ projectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(fieldsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(`
    SELECT field_id AS id, label 
    FROM fields 
    WHERE 
      project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}
      ${filterString ? ` AND ${filterString}` : ''} 
    ORDER BY table_name, name, level`)

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `
    SELECT count(*) 
    FROM fields 
    WHERE project_id  ${projectId ? `= '${projectId}'` : 'IS NULL'}`,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = ['data', ...(projectId ? ['projects', projectId] : [])]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'fields']
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      ownUrl,
      urlPath,
      label: buildNavLabel({
        loading,
        isFiltered,
        countFiltered: navs.length,
        countUnfiltered,
        namePlural: 'Fields',
      }),
      nameSingular: 'Field',
      navs,
    }
  }, [
    countUnfiltered,
    isFiltered,
    loading,
    location.pathname,
    openNodes,
    projectId,
    res?.rows,
  ])

  return { loading, navData, isFiltered }
}
