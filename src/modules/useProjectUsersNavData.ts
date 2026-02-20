import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { projectUsersFilterAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
}

type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

export const useProjectUsersNavData = ({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(projectUsersFilterAtom)
  const location = useLocation()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'users']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const sql = isOpen
    ? `
    WITH
      count_unfiltered AS (SELECT count(*) FROM project_users WHERE project_id = '${projectId}'),
      count_filtered AS (SELECT count(*) FROM project_users WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ''})
    SELECT
      project_user_id AS id,
      label,
      count_unfiltered.count AS count_unfiltered,
      count_filtered.count AS count_filtered
    FROM project_users, count_unfiltered, count_filtered
    WHERE project_id = '${projectId}'
      ${isFiltered ? ` AND ${filterString}` : ''}
    ORDER BY label`
    : `
    WITH
      count_unfiltered AS (SELECT count(*) FROM project_users WHERE project_id = '${projectId}'),
      count_filtered AS (SELECT count(*) FROM project_users WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ''})
    SELECT
      count_unfiltered.count AS count_unfiltered,
      count_filtered.count AS count_filtered
    FROM count_unfiltered, count_filtered`

  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      countFiltered,
      countUnfiltered,
      namePlural: 'Users',
      loading,
      isFiltered,
    }),
    nameSingular: 'Project User',
    navs,
  }

  return { loading, navData, isFiltered }
}
