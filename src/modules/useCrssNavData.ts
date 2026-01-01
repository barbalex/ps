import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'crs']
const ownUrl = `/${ownArray.join('/')}`
const limit = 100

type NavData = {
  id: string
  label: string
  count: number
}[]

export const useCrssNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const sql = isOpen
    ? `
      WITH count AS (SELECT COUNT(crs_id) as count FROM crs)
      SELECT
        crs_id as id,
        label,
        count.count
      FROM crs, count
      ORDER BY label
      LIMIT ${limit}`
    : `SELECT COUNT(crs_id) as count FROM crs`

  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const count = navs[0]?.count ?? 0
  const urlPath = location.pathname.split('/').filter((p) => p !== '')

  // needs to work not only works for urlPath, for all opened paths!
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)
  const isLimited = count > limit && isOpen

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
      countFiltered: count,
      namePlural: 'CRS',
      loading,
      isLimited,
    }),
    nameSingular: 'CRS',
    navs,
  }

  return { loading, navData }
}
