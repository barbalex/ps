import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { projectsFilterAtom, treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'projects']
const ownUrl = `/${ownArray.join('/')}`

export const useProjectsNavData = (params) => {
  const forBreadcrumb = params?.forBreadcrumb ?? false
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(projectsFilterAtom)
  const filterString = filterStringFromFilter(filter, 'projects')
  const isFiltered = !!filterString

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = useMemo(
    () => openNodes.some((array) => isEqual(array, ownArray)),
    [openNodes],
  )
  const withNavs = !forBreadcrumb || isOpen

  const sql =
    withNavs ?
      `
      WITH
        count_unfiltered AS (SELECT count(*) FROM projects),
        count_filtered AS (SELECT count(*) FROM projects${isFiltered ? ` WHERE ${filterString}` : ''})
      SELECT
        project_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM projects, count_unfiltered, count_filtered
      ${isFiltered ? ` WHERE ${filterString}` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM projects),
        count_filtered AS (SELECT count(*) FROM projects ${isFiltered ? ` WHERE ${filterString}` : ''})
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
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 1,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label: buildNavLabel({
        loading,
        isFiltered,
        countFiltered,
        countUnfiltered,
        namePlural: 'Projects',
      }),
      nameSingular: 'Project',
      navs,
    }
  }, [isFiltered, isOpen, loading, location.pathname, res?.rows])

  return { loading, navData, isFiltered }
}
