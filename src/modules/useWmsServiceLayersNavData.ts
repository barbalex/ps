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

type NavDataOpen = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

type NavDataClosed = {
  count_unfiltered: number
  count_filtered: number
}[]

export const useWmsServiceLayersNavData = ({ projectId, wmsServiceId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const parentArray = ['data', 'projects', projectId, 'wms-services', wmsServiceId]
  const ownArray = [...parentArray, 'layers']
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM wms_service_layers WHERE wms_service_id = '${wmsServiceId}'),
        count_filtered AS (SELECT count(*) FROM wms_service_layers WHERE wms_service_id = '${wmsServiceId}')
      SELECT
        wms_service_layer_id AS id,
        coalesce(label, name, wms_service_layer_id::text) AS label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM wms_service_layers, count_unfiltered, count_filtered
      WHERE
        wms_service_id = '${wmsServiceId}'
      ORDER BY label, wms_service_layer_id
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM wms_service_layers WHERE wms_service_id = '${wmsServiceId}'),
        count_filtered AS (SELECT count(*) FROM wms_service_layers WHERE wms_service_id = '${wmsServiceId}')
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavDataOpen | NavDataClosed = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0

  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      loading,
      isFiltered: false,
      countFiltered,
      countUnfiltered,
      namePlural: 'Layers',
    }),
    nameSingular: 'Layer',
    navs,
  }

  return { loading, navData }
}
