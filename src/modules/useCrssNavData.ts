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
const limit = 100

export const useCrssNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const resCount = useLiveQuery(`SELECT COUNT(crs_id) as count FROM crs`)
  const count = resCount?.rows?.[0]?.count ?? 0

  const res = useLiveQuery(`
      SELECT
        crs_id as id,
        label
      FROM crs
      ORDER BY label
      LIMIT ${limit}`)

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)
    const isLimited = count > limit && isOpen
    const label = `CRS (${resCount === undefined ? '...' : formatNumber(count)}${isLimited ? `, first ${limit}` : ''})`

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
  }, [count, location.pathname, openNodes, res?.rows, resCount])

  return { loading, navData }
}
