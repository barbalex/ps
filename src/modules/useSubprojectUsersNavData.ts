import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { subprojectUsersFilterAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
}

type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}

export const useSubprojectUsersNavData = ({
  projectId,
  subprojectId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(subprojectUsersFilterAtom)
  const location = useLocation()

  const filterString = filterStringFromFilter(filter, 'subproject_users')
  const isFiltered = !!filterString

  const ownArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'users',
  ]
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM subproject_users WHERE subproject_id = '${subprojectId}'),
        count_filtered AS (SELECT count(*) FROM subproject_users WHERE subproject_id = '${subprojectId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        subproject_user_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM subproject_users, count_unfiltered, count_filtered
      WHERE subproject_id = '${subprojectId}'
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label`
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM subproject_users WHERE subproject_id = '${subprojectId}'),
        count_filtered AS (SELECT count(*) FROM subproject_users WHERE subproject_id = '${subprojectId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered`

  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavData[] = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`
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
      loading,
      countFiltered,
      countUnfiltered,
      namePlural: 'Users',
      isFiltered,
    }),
    nameSingular: 'Subproject User',
    navs,
  }

  return { loading, navData, isFiltered }
}
