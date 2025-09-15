import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { fieldsFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useFieldsNavData = ({ projectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const parentArray = useMemo(
    () => ['data', ...(projectId ? ['projects', projectId] : [])],
    [projectId],
  )

  const ownArray = useMemo(() => [...parentArray, 'fields'], [parentArray])
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = useMemo(
    () => openNodes.some((array) => isEqual(array, ownArray)),
    [openNodes, ownArray],
  )

  const [filter] = useAtom(fieldsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql =
    isOpen ?
      `
      WITH
        count_unfiltered AS (SELECT count(*) FROM fields WHERE project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}),
        count_filtered AS (SELECT count(*) FROM fields WHERE project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        field_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM fields, count_unfiltered, count_filtered
      WHERE project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY table_name, name, level
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM fields WHERE project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}),
        count_filtered AS (SELECT count(*) FROM fields WHERE project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const countUnfiltered = navs[0]?.count_unfiltered ?? 0
    const countFiltered = navs[0]?.count_filtered ?? 0

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentUrl = `/${parentArray.join('/')}`
    const ownUrl = `/${ownArray.join('/')}`

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
        countFiltered,
        countUnfiltered,
        namePlural: 'Fields',
      }),
      nameSingular: 'Field',
      navs,
    }
  }, [
    isFiltered,
    isOpen,
    loading,
    location.pathname,
    ownArray,
    parentArray,
    res?.rows,
  ])

  return { loading, navData, isFiltered }
}
