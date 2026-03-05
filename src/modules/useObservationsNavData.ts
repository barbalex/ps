import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import {
  observationsNotToAssignFilterAtom,
  observationsToAssessFilterAtom,
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

export const useObservationsNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  isToAssess = false,
  isNotToAssign = false,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filterToAssess] = useAtom(observationsToAssessFilterAtom)
  const [filterNotToAssign] = useAtom(observationsNotToAssignFilterAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const filter = isToAssess
    ? filterToAssess
    : isNotToAssign
      ? filterNotToAssign
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
      ? ['observations-to-assess']
      : isNotToAssign
        ? ['observations-not-to-assign']
        : ['observations']),
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
        FROM observations o
        INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
        WHERE ${baseFilter}
      ),
      count_filtered AS (
        SELECT count(*)
        FROM observations o
        INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
        WHERE ${baseFilter}
        ${isFiltered ? ` AND ${filterString}` : ''}
      )
    SELECT
      o.observation_id AS id,
      o.label,
      count_unfiltered.count AS count_unfiltered,
      count_filtered.count AS count_filtered
    FROM observations o
      INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id,
      count_unfiltered,
      count_filtered
    WHERE ${baseFilter}
    ${isFiltered ? ` AND ${filterString}` : ''}
    ORDER BY label`
      : `
    WITH
      count_unfiltered AS (
        SELECT count(*)
        FROM observations o
        INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
        WHERE ${baseFilter}
      ),
      count_filtered AS (
        SELECT count(*)
        FROM observations o
        INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
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
    ? formatMessage({
        id: 'BEylmv',
        defaultMessage: 'zu beurteilende Beobachtungen',
      })
    : isNotToAssign
      ? formatMessage({
          id: 'slC/ul',
          defaultMessage: 'nicht zuzuordnende Beobachtungen',
        })
      : formatMessage({
          id: 'OaXR/X',
          defaultMessage: 'zugeordnete Beobachtungen',
        })
  const nameSingular = isToAssess
    ? formatMessage({
        id: 'tfUHK5',
        defaultMessage: 'zu beurteilende Beobachtung',
      })
    : isNotToAssign
      ? formatMessage({
          id: 'aanYYz',
          defaultMessage: 'nicht zuzuordnende Beobachtung',
        })
      : formatMessage({
          id: 'gKq4qF',
          defaultMessage: 'zugeordnete Beobachtung',
        })

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
