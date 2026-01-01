import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { projectsFilterAtom, treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'projects']
const ownUrl = `/${ownArray.join('/')}`

type NavDataOpen = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

type NavDataClosed = {
  count_unfiltered: number
  count_filtered: number
}[]

type Props = {
  forBreadcrumb?: boolean
}

const getNavData = ({ res, isOpen, loading, isFiltered }) => {
  const navs: NavDataOpen | NavDataClosed = res?.rows ?? []
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
}

export const useProjectsNavData = (params?: Props) => {
  const forBreadcrumb = params?.forBreadcrumb ?? false
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(projectsFilterAtom)
  const filterString = filterStringFromFilter(filter, 'projects')
  const isFiltered = !!filterString

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const withNavs = !forBreadcrumb || isOpen

  // console.log('useProjectsNavData', {
  //   withNavs,
  //   isFiltered,
  //   filterString,
  //   isOpen,
  // })

  const sql = withNavs
    ? `
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
  // TODO: this only returns once - never with the answer of the query!!!!
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navData = getNavData({ res, isOpen, loading, isFiltered })

  return { loading, navData, isFiltered }
}
