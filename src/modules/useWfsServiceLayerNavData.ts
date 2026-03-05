import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  wfsServiceId: string
  wfsServiceLayerId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useWfsServiceLayerNavData = ({
  projectId,
  wfsServiceId,
  wfsServiceLayerId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `
      SELECT
        wfs_service_layer_id AS id,
        coalesce(label, name, wfs_service_layer_id::text) AS label
      FROM wfs_service_layers
      WHERE
        wfs_service_layer_id = $1
    `,
    [wfsServiceLayerId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId,
    'wfs-services',
    wfsServiceId,
    'layers',
  ]
  const ownArray = [...parentArray, wfsServiceLayerId]
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)

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
    nameSingular: formatMessage({ id: 'JY1Jke', defaultMessage: 'Ebene' }),
  }

  return { loading, navData }
}
