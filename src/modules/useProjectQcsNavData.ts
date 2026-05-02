import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { languageAtom, projectQcsFilterAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
}

type NavData = {
  id: string
  label: string | null
  count_unfiltered?: number
  count_filtered?: number
}[]

export const useProjectQcsNavData = ({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(projectQcsFilterAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'qcs']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const labelExpr = `COALESCE(NULLIF(name_${language}, ''), name_de, project_qc_id::text)`

  const sql = isOpen
    ? `
    WITH
      count_unfiltered AS (SELECT count(*) FROM project_qcs WHERE project_id = '${projectId}'),
      count_filtered AS (SELECT count(*) FROM project_qcs WHERE project_id = '${projectId}'${isFiltered ? ` AND ${filterString}` : ''})
    SELECT
      project_qc_id AS id,
      ${labelExpr} AS label,
      count_unfiltered.count AS count_unfiltered,
      count_filtered.count AS count_filtered
    FROM project_qcs, count_unfiltered, count_filtered
    WHERE project_id = '${projectId}'${isFiltered ? ` AND ${filterString}` : ''}
    ORDER BY label`
    : `
    WITH
      count_unfiltered AS (SELECT count(*) FROM project_qcs WHERE project_id = '${projectId}'),
      count_filtered AS (SELECT count(*) FROM project_qcs WHERE project_id = '${projectId}'${isFiltered ? ` AND ${filterString}` : ''})
    SELECT
      count_unfiltered.count AS count_unfiltered,
      count_filtered.count AS count_filtered
    FROM count_unfiltered, count_filtered`

  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const countUnfiltered = (navs[0]?.count_unfiltered as number) ?? 0
  const countFiltered = (navs[0]?.count_filtered as number) ?? 0

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
        id: 'qcs.namePlural',
        defaultMessage: 'Qualitätskontrollen',
      }),
    }),
    nameSingular: formatMessage({
      id: 'qcs.nameSingular',
      defaultMessage: 'Qualitätskontrolle',
    }),
    navs,
  }

  return { loading, navData, isFiltered }
}
