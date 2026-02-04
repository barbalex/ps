import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  wmsServiceId: string
}

type NavData = {
  id: string
  label: string | null
  layers_count_unfiltered: number
}

export const useWmsServiceNavData = ({ projectId, wmsServiceId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    WITH
      layers_count AS (SELECT COUNT(*) AS count FROM wms_service_layers WHERE wms_service_id = '${wmsServiceId}')
    SELECT
      wms_service_id AS id,
      coalesce(url, wms_service_id::text) AS label,
      layers_count.count AS layers_count_unfiltered
    FROM
      wms_services, 
      layers_count
    WHERE
      wms_services.wms_service_id = '${wmsServiceId}'`,
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
    navs: [
      { id: 'wms-service', label: 'WMS Service' },
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
