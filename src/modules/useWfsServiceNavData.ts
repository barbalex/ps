import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  wfsServiceId: string
}

type NavData = {
  id: string
  label: string | null
  layers_count_unfiltered: number
}

export const useWfsServiceNavData = ({ projectId, wfsServiceId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    WITH
      layers_count AS (SELECT COUNT(*) AS count FROM wfs_service_layers WHERE wfs_service_id = '${wfsServiceId}')
    SELECT
      wfs_service_id AS id,
      coalesce(url, wfs_service_id::text) AS label,
      layers_count.count AS layers_count_unfiltered
    FROM
      wfs_services, 
      layers_count
    WHERE
      wfs_services.wfs_service_id = '${wfsServiceId}'`,
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId, 'wfs-services']
  const ownArray = [...parentArray, wfsServiceId]
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
    nameSingular: 'WFS Service',
    navs: [
      { id: 'wfs-service', label: 'WFS Service' },
      {
        id: 'layers',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.layers_count_unfiltered ?? 0,
          namePlural: 'Layers',
        }),
      },
    ],
  }

  return { loading, navData }
}
