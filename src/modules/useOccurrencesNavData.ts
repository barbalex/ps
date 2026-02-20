import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import {
  occurrencesNotToAssignFilterAtom,
  occurrencesToAssessFilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  isToAssess?: boolean
  isNotToAssign?: boolean
}

type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

export const useOccurrencesNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  isToAssess = false,
  isNotToAssign = false,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filterToAssess] = useAtom(occurrencesToAssessFilterAtom)
  const [filterNotToAssign] = useAtom(occurrencesNotToAssignFilterAtom)
  const location = useLocation()

  const filter =
    isToAssess ? filterToAssess
    : isNotToAssign ? filterNotToAssign
    : []
  const filterString = filterStringFromFilter(filter, 'o')
  const isFiltered = !!filterString

  let baseFilter = `oi.subproject_id = '${subprojectId}'`
  if (isToAssess) {
    baseFilter += ' AND o.not_to_assign IS NOT TRUE AND o.place_id IS NULL'
  } else if (isNotToAssign) {
    baseFilter += ' AND o.not_to_assign IS TRUE AND o.place_id IS NULL'
  } else if (!!placeId || !!placeId2) {
    baseFilter += ` AND o.place_id = '${placeId2 ?? placeId}'`
  }

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [
    ...parentArray,
    ...(isToAssess
      ? ['occurrences-to-assess']
      : isNotToAssign
        ? ['occurrences-not-to-assign']
        : ['occurrences']),
  ]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const res = useLiveQuery(
    isOpen
      ? `
    WITH
      count_unfiltered AS (
        SELECT count(*)
        FROM occurrences o
        INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
        WHERE ${baseFilter}
      ),
      count_filtered AS (
        SELECT count(*)
        FROM occurrences o
        INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
        WHERE ${baseFilter}
        ${isFiltered ? ` AND ${filterString}` : ''}
      )
    SELECT
      o.occurrence_id AS id,
      o.label,
      count_unfiltered.count AS count_unfiltered,
      count_filtered.count AS count_filtered
    FROM occurrences o
      INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id,
      count_unfiltered,
      count_filtered
    WHERE ${baseFilter}
    ${isFiltered ? ` AND ${filterString}` : ''}
    ORDER BY label`
      : `
    WITH
      count_unfiltered AS (
        SELECT count(*)
        FROM occurrences o
        INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
        WHERE ${baseFilter}
      ),
      count_filtered AS (
        SELECT count(*)
        FROM occurrences o
        INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
        WHERE ${baseFilter}
        ${isFiltered ? ` AND ${filterString}` : ''}
      )
    SELECT
      count_unfiltered.count AS count_unfiltered,
      count_filtered.count AS count_filtered
    FROM count_unfiltered,
      count_filtered`,
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)
  const namePlural = isToAssess
    ? ' Occurrences To Assess'
    : isNotToAssign
      ? 'Occurrences Not To Assign'
      : 'Occurrences Assigned'
  const nameSingular = isToAssess
    ? ' Occurrence to assess'
    : isNotToAssign
      ? 'Occurrence not to assign'
      : 'Occurrence assigned'

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      countFiltered,
      countUnfiltered,
      namePlural,
      loading,
      isFiltered,
    }),
    nameSingular,
    navs,
  }

  return { loading, navData, isFiltered }
}
