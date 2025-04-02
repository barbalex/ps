import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { vectorLayersFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useVectorLayersNavData = ({ projectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(vectorLayersFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(
    `
    SELECT
      vector_layer_id AS id,
      label 
    FROM vector_layers 
    WHERE 
      project_id = $1
      ${isFiltered ? `AND ${filterString} ` : ''} 
    ORDER BY label`,
    [projectId],
  )

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM vector_layers WHERE project_id = $1`,
    [projectId],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = ['data', 'projects', projectId]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'vector-layers']
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
      label: buildNavLabel({
        loading,
        isFiltered,
        countFiltered: navs.length,
        countUnfiltered,
        namePlural: 'Vector Layers',
      }),
      nameSingular: 'Vector Layer',
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
