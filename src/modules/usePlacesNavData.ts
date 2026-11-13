import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { getPlaceFallbackNames } from './placeNameFallback.ts'
import { useNavRollups } from './navRollupsContext.ts'
import {
  places1FilterAtom,
  places2FilterAtom,
  treeOpenNodesAtom,
  languageAtom,
} from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
}

type NavDataOpen = {
  id: string
  label: string | null
  count_unfiltered: number
  count_filtered: number
}

type NavDataClosed = {
  count_unfiltered: number
  count_filtered: number
}

export const usePlacesNavData = ({
  projectId,
  subprojectId,
  placeId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    ...(placeId ? ['places', placeId] : []),
  ]
  const ownArray = [...parentArray, 'places']
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const [filter] = useAtom(placeId ? places2FilterAtom : places1FilterAtom)
  const filterString = filterStringFromFilter(filter, 'places')
  const isFiltered = !!filterString

  // shared lookups (see NavDataProvider) instead of per-sibling queries for
  // the projects row and the place_levels names
  const rollups = useNavRollups()
  const project = rollups.projectRow(projectId)
  const levelNames = rollups.placeLevel(projectId, placeId ? 2 : 1)

  const projectType = project?.type
  // configured place ordering: names of data fields, applied before the
  // label fallback. Values may come as jsonb array, comma string or
  // postgres array literal, depending on who wrote them
  const placesOrderByRaw = project?.places_order_by
  const placesOrderBy: string[] =
    Array.isArray(placesOrderByRaw) ?
      placesOrderByRaw.map(String).filter(Boolean)
    : typeof placesOrderByRaw === 'string' ?
      placesOrderByRaw
        .replace(/^\{|\}$/g, '')
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean)
    : []
  // numeric values sort numerically ("2" < "10"), text values lexically
  const orderBySql = [
    ...placesOrderBy.flatMap((field) => [
      `(case when data->>'${field}' ~ '^[0-9]+([.][0-9]+)?$' then (data->>'${field}')::numeric end) asc nulls last`,
      `(data->>'${field}') asc nulls last`,
    ]),
    'label',
  ].join(', ')

  const sql =
    isOpen ?
      `
      WITH
        count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        }),
        count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        } ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        place_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM places, count_unfiltered, count_filtered
      WHERE
        places.subproject_id = '${subprojectId}'
        AND places.parent_id ${placeId ? `= '${placeId}'` : `IS NULL`}
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY ${orderBySql}
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' and parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        }),
        count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' and parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        } ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const level = placeId ? 2 : 1
  const fallbackNames = getPlaceFallbackNames(projectType, level, formatMessage)

  const loading = res === undefined

  const nameSingular =
    (levelNames?.[`name_singular_${language}` as const] as
      string | null | undefined) ?? fallbackNames.singular
  const namePlural =
    (levelNames?.[`name_plural_${language}` as const] as
      string | null | undefined) ?? fallbackNames.plural

  const navs = (res?.rows ?? []) as NavDataOpen[] | NavDataClosed[]
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
      namePlural,
    }),
    nameSingular,
    namePlural,
    navs,
  }

  return { loading, navData, isFiltered }
}
