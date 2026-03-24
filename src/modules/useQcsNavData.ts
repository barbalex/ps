import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { languageAtom, qcsFilterAtom, treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'qcs']
const ownUrl = `/${ownArray.join('/')}`

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

export const useQcsNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const [language] = useAtom(languageAtom)

  const [filter] = useAtom(qcsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM qcs),
        count_filtered AS (SELECT count(*) FROM qcs ${isFiltered ? ` WHERE ${filterString}` : ''})
      SELECT
        qcs_id AS id,
        COALESCE(NULLIF(label_${language}, ''), label_de) AS label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM qcs, count_unfiltered, count_filtered
      ${isFiltered ? ` WHERE ${filterString}` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM qcs),
        count_filtered AS (SELECT count(*) FROM qcs ${isFiltered ? ` WHERE ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navs: NavDataOpen[] | NavDataClosed[] = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
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
