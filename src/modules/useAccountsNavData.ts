import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { accountsFilterAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  userId?: string
}

const parentArray = ['data']
const ownArray = [...parentArray, 'accounts']

type NavData = {
  id: string
  label: string
  count_unfiltered: number
  count_filtered: number
}[]

export const useAccountsNavData = ({ userId }: Props = {}) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(accountsFilterAtom)
  const location = useLocation()

  const scopeFilter = userId ? `user_id = '${userId}'` : null
  const scopedFilter = scopeFilter
    ? filter.map((orFilter) => ({ ...orFilter, user_id: userId }))
    : filter

  const filterString = filterStringFromFilter(scopedFilter)
  const isFiltered = !!filterString

  const resolvedParentArray = userId ? ['data', 'users', userId] : parentArray
  const resolvedOwnArray = userId
    ? ['data', 'users', userId, 'accounts']
    : ownArray
  const resolvedParentUrl = `/${resolvedParentArray.join('/')}`
  const resolvedOwnUrl = `/${resolvedOwnArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, resolvedOwnArray))

  const whereClause = isFiltered
    ? `WHERE ${filterString}`
    : scopeFilter
      ? `WHERE ${scopeFilter}`
      : ''

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM accounts ${scopeFilter ? ` WHERE ${scopeFilter}` : ''}),
        count_filtered AS (SELECT count(*) FROM accounts ${whereClause})
      SELECT
        account_id as id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM accounts, count_unfiltered, count_filtered
      ${whereClause}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM accounts ${scopeFilter ? ` WHERE ${scopeFilter}` : ''}),
        count_filtered AS (SELECT count(*) FROM accounts ${whereClause})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  const isInActiveNodeArray = resolvedOwnArray.every(
    (part, i) => urlPath[i] === part,
  )
  const isActive = isEqual(urlPath, resolvedOwnArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: userId ? 3 : 1,
    parentUrl: resolvedParentUrl,
    ownArray: resolvedOwnArray,
    ownUrl: resolvedOwnUrl,
    urlPath,
    label: buildNavLabel({
      countFiltered,
      countUnfiltered,
      namePlural: formatMessage({ id: '/40i9A', defaultMessage: 'Konten' }),
      loading,
      isFiltered,
    }),
    nameSingular: formatMessage({ id: '9oKaIi', defaultMessage: 'Konto' }),
    navs,
  }

  return { loading, navData, isFiltered }
}
