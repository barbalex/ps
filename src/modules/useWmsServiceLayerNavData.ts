import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  wmsServiceId: string
  wmsServiceLayerId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useWmsServiceLayerNavData = ({ projectId, wmsServiceId, wmsServiceLayerId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        wms_service_layer_id AS id,
        coalesce(label, name, wms_service_layer_id::text) AS label
      FROM wms_service_layers
      WHERE
        wms_service_layer_id = $1
    `,
    [wmsServiceLayerId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId, 'wms-services', wmsServiceId, 'layers']
  const ownArray = [...parentArray, wmsServiceLayerId]
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
    nameSingular: 'Layer',
  }

  return { loading, navData }
}
