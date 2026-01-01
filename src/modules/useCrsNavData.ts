import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data', 'crs']
const parentUrl = `/${parentArray.join('/')}`

type Props = {
  crsId: string
}

type NavData = {
  id: string
  label: string
}

export const useCrsNavData = ({ crsId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        crs_id as id,
        label
      FROM crs
      WHERE crs_id = $1`,
    [crsId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: 'CRS',
  }

  return { loading, navData }
}
