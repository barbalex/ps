import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { getPlaceFallbackNames } from './placeNameFallback.ts'
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
  name_singular: string
  name_plural: string
}

type NavDataClosed = {
  count_unfiltered: number
  count_filtered: number
  name_singular: string
  name_plural: string
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

  const projectTypeRes = useLiveQuery(
    `SELECT type, places_order_by FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const projectType = projectTypeRes?.rows?.[0]?.type as
    | string
    | null
    | undefined
  // configured place ordering: names of data fields, applied before the
  // label fallback. Values may come as jsonb array, comma string or
  // postgres array literal, depending on who wrote them
  const placesOrderByRaw = projectTypeRes?.rows?.[0]?.places_order_by
  const placesOrderBy: string[] = Array.isArray(placesOrderByRaw)
    ? placesOrderByRaw.map(String).filter(Boolean)
    : typeof placesOrderByRaw === 'string'
      ? placesOrderByRaw
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

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        }),
        count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        } ${isFiltered ? ` AND ${filterString}` : ''}),
        names AS (SELECT name_singular_${language}, name_plural_${language} FROM place_levels WHERE project_id = '${projectId}' and level = ${placeId ? 2 : 1})
      SELECT
        place_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered,
        names.name_singular_${language} AS name_singular,
        names.name_plural_${language} AS name_plural
      FROM places, count_unfiltered, count_filtered, names
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
        } ${isFiltered ? ` AND ${filterString}` : ''}),
        names AS (SELECT name_singular_${language}, name_plural_${language} FROM place_levels WHERE project_id = '${projectId}' and level = ${placeId ? 2 : 1})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered,
        names.name_singular_${language} AS name_singular,
        names.name_plural_${language} AS name_plural
      FROM count_unfiltered, count_filtered, names
    `
  const res = useLiveQuery(sql)

  const level = placeId ? 2 : 1
  const fallbackNames = getPlaceFallbackNames(projectType, level, formatMessage)

  const loading = res === undefined

  const nameSingular =
    (res?.rows?.[0]?.name_singular as string | undefined) ??
    fallbackNames.singular
  const namePlural =
    (res?.rows?.[0]?.name_plural as string | undefined) ??
    fallbackNames.plural

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
