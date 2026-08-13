import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { getVectorLayerLabel } from './vectorLayerLabel.ts'
import { vectorLayersFilterAtom, treeOpenNodesAtom, languageAtom } from '../store.ts'
import type VectorLayers from '../models/public/VectorLayers.ts'

type Props = {
  projectId: string
}

type NavDataOpen = {
  id: string
  label: string
  count_unfiltered: number
  count_filtered: number
}

type NavDataClosed = {
  count_unfiltered: number
  count_filtered: number
}

export const useVectorLayersNavData = ({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = ['data', 'projects', projectId]
  const ownArray = [...parentArray, 'vector-layers']
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const [filter] = useAtom(vectorLayersFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM vector_layers WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM vector_layers WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        vector_layer_id AS id,
        name,
        type,
        own_table,
        own_table_level,
        label_de,
        label_en,
        label_fr,
        label_it,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM vector_layers, count_unfiltered, count_filtered
      WHERE
        project_id = '${projectId}'
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY name
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM vector_layers WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM vector_layers WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)
  const placeLevelsRes = useLiveQuery(
    `SELECT * FROM place_levels WHERE project_id = $1`,
    [projectId],
  )
  const placeLevels = placeLevelsRes?.rows ?? []

  const loading = res === undefined

  const rawRows = res?.rows ?? []
  // Compute the localized display label per layer (own layers derive it from
  // place_levels; wfs/upload use stored label_<lang> with de fallback).
  const navs: NavDataOpen[] | NavDataClosed[] = isOpen
    ? (rawRows
        .map((r) => ({
          id: r.id,
          label: getVectorLayerLabel(
            { ...r, vector_layer_id: r.id } as VectorLayers,
            language,
            placeLevels,
          ),
          count_unfiltered: r.count_unfiltered,
          count_filtered: r.count_filtered,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)) as NavDataOpen[])
    : (rawRows as NavDataClosed[])
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
      isFiltered,
      countFiltered,
      countUnfiltered,
      namePlural: formatMessage({
        id: 'nauDh5',
        defaultMessage: 'Vektor-Ebenen',
      }),
    }),
    nameSingular: formatMessage({
      id: 'fN0sZQ',
      defaultMessage: 'Vektor-Ebene',
    }),
    navs,
  }

  return { loading, navData, isFiltered }
}
