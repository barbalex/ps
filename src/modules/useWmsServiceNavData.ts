import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  wmsServiceId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useWmsServiceNavData = ({ projectId, wmsServiceId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        wms_service_id AS id,
        coalesce(url, wms_service_id::text) AS label
      FROM wms_services
      WHERE
        wms_service_id = $1
    `,
    [wmsServiceId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId, 'wms-services']
  const ownArray = [...parentArray, wmsServiceId]
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label,
    notFound,
    nameSingular: 'WMS Service',
  }

  return { loading, navData }
}
