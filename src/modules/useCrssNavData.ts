import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { formatNumber } from './formatNumber.ts'
import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'crs']
const ownUrl = `/${ownArray.join('/')}`
const limit = 100

export const useCrssNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const isOpen = useMemo(
    () => openNodes.some((array) => isEqual(array, ownArray)),
    [openNodes],
  )
  const sql =
    isOpen ?
      `
      WITH crs_count AS (SELECT COUNT(crs_id) as count FROM crs)
      SELECT
        crs_id as id,
        label,
        crs_count.count
      FROM crs, crs_count
      ORDER BY label
      LIMIT ${limit}`
    : `SELECT COUNT(crs_id) as count FROM crs`

  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const count = navs[0]?.count ?? 0
    const urlPath = location.pathname.split('/').filter((p) => p !== '')

    // needs to work not only works for urlPath, for all opened paths!
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)
    const isLimited = count > limit && isOpen
    const label = `CRS (${loading ? '...' : formatNumber(count)}${isLimited ? `, first ${limit}` : ''})`

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 1,
      parentUrl,
      ownArray,
      ownUrl,
      urlPath,
      toParams: {},
      label,
      nameSingular: 'CRS',
      navs,
    }
  }, [isOpen, loading, location.pathname, res?.rows])

  return { loading, navData }
}
