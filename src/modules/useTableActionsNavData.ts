import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import {
  getTableViewFilterAtom,
  treeOpenNodesSetAtom,
  languageAtom,
} from '../store.ts'
import type { TableRowFilter } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  tableViewId: string
}

type ViewData = {
  table_view_id: string
  table_name: string | null
  filter: unknown
  label_by: unknown
  name_singular_de: string | null
  name_singular_en: string | null
  name_singular_fr: string | null
  name_singular_it: string | null
  name_plural_de: string | null
  name_plural_en: string | null
  name_plural_fr: string | null
  name_plural_it: string | null
}

type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

export const useTableActionsNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  tableViewId,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'table-views', tableViewId, 'actions']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))

  const resView = useLiveQuery<ViewData>(
    `SELECT * FROM table_views WHERE table_view_id = $1`,
    [tableViewId],
  )
  const view = resView?.rows?.[0]

  // the view's static filter defines which rows belong to it
  const viewFilter = (view?.filter ?? []) as TableRowFilter[]
  const viewFilterString = filterStringFromFilter(viewFilter)
  const hasViewFilter = !!viewFilterString

  // the user's runtime filter on top of the view
  const [filter] = useAtom(getTableViewFilterAtom(tableViewId))
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  // rows are labeled in apf2 manner: 4-digit year, then the value of each
  // field in label_by, separated by ": " — e.g. "2019: Kontrolle"
  const labelBy = (view?.label_by ?? []) as string[]
  const viewLabelSql = `coalesce(lpad(extract(year from actions.date)::text, 4, '0'), '(kein Jahr)')${labelBy
    .map(
      (field) =>
        ` || ': ' || coalesce(actions.data->>'${field}', '(kein ${field.charAt(0).toUpperCase()}${field.slice(1)})')`,
    )
    .join('')}`

  const sql =
    isOpen ?
      `
      WITH
        count_unfiltered AS (SELECT count(*) FROM actions WHERE place_id = '${placeId2 ?? placeId}'${hasViewFilter ? ` AND (${viewFilterString})` : ''}),
        count_filtered AS (SELECT count(*) FROM actions WHERE place_id = '${placeId2 ?? placeId}'${hasViewFilter ? ` AND (${viewFilterString})` : ''}${isFiltered ? ` AND (${filterString})` : ''})
      SELECT
        action_id AS id,
        ${viewLabelSql} AS label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM actions, count_unfiltered, count_filtered
      WHERE
        place_id = '${placeId2 ?? placeId}'
        ${hasViewFilter ? `AND (${viewFilterString})` : ''}
        ${isFiltered ? `AND (${filterString})` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM actions WHERE place_id = '${placeId2 ?? placeId}'${hasViewFilter ? ` AND (${viewFilterString})` : ''}),
        count_filtered AS (SELECT count(*) FROM actions WHERE place_id = '${placeId2 ?? placeId}'${hasViewFilter ? ` AND (${viewFilterString})` : ''}${isFiltered ? ` AND (${filterString})` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery<NavData[number]>(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const namePlural =
    view?.[`name_plural_${language}`] ??
    view?.name_plural_de ??
    formatMessage({ id: 'pH7MgC', defaultMessage: 'Massnahmen' })
  const nameSingular =
    view?.[`name_singular_${language}`] ??
    view?.name_singular_de ??
    formatMessage({ id: 'mK9wN7', defaultMessage: 'Massnahme' })

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
      namePlural,
    }),
    nameSingular,
    navs,
  }

  return { loading, navData, isFiltered, view }
}
