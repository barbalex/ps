import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { usersFilterAtom, treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'users']
const ownUrl = `/${ownArray.join('/')}`

type NavData = {
  id: string
  label: string
}

export const useUsersNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(usersFilterAtom)
  const location = useLocation()

  const sanitizedFilter = filter.map((orFilter) =>
    Object.fromEntries(
      Object.entries(orFilter).filter(
        ([key]) =>
          key === 'email' || key === 'label' || key.startsWith('data.'),
      ),
    ),
  )

  const filterString = filterStringFromFilter(sanitizedFilter)
  const isFiltered = !!filterString

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM users),
        count_filtered AS (SELECT count(*) FROM users ${isFiltered ? ` WHERE ${filterString}` : ''})
      SELECT
        user_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM users, count_unfiltered, count_filtered
      ${isFiltered ? ` WHERE ${filterString}` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM users),
        count_filtered AS (SELECT count(*) FROM users ${isFiltered ? ` WHERE ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const navs: NavData[] = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label: buildNavLabel({
      loading,
      isFiltered,
      countFiltered,
      countUnfiltered,
      namePlural: 'Users',
    }),
    nameSingular: 'User',
    navs,
  }

  return { loading, navData, isFiltered }
}
