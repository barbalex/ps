import { useUrlFilter } from './useUrlFilter.ts'
import { useProjectAreaFilter } from './useProjectAreaFilter.ts'
import { andFilters } from './projectAreaFilter.ts'
import { spatialListQuery } from './spatialListQuery.ts'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { getPlaceLevelNames } from './placeNameFallback.ts'
import { useNavRollups } from './navRollupsContext.ts'
import { treeOpenNodesSetAtom, languageAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  navigation?: boolean
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
  navigation = false,
}: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
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
  const isOpen = openNodesSet.has(ownArray.join('/'))

  const [filter] = useUrlFilter(placeId ? 'places2' : 'places1')
  const area = useProjectAreaFilter(projectId)
  const filterString = andFilters(filterStringFromFilter(filter, 'places'),
    navigation ? area.navigationPlaces(!placeId) : area.matches('places'))
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

  const sql = spatialListQuery({
    open: isOpen, select: `place_id AS id, label${placesOrderBy.length ? ', data' : ''}`,
    from: 'places',
    where: `subproject_id = '${subprojectId}' AND parent_id ${placeId ? `= '${placeId}'` : 'IS NULL'}`,
    filter: filterString, orderBy: orderBySql,
  })
  const res = useLiveQuery(sql)

  const level = placeId ? 2 : 1
  const { singular: nameSingular, plural: namePlural } =
    getPlaceLevelNames(levelNames, language, projectType, level, formatMessage)

  const loading = res === undefined

  const navs = (res?.rows ?? []).filter((row) => row.id) as NavDataOpen[]
  const counts = res?.rows[0] as NavDataClosed | undefined
  const countUnfiltered = counts?.count_unfiltered ?? 0
  const countFiltered = counts?.count_filtered ?? 0

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
