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
import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  isToAssess?: boolean
  isNotToAssign?: boolean
}

// labels stay plain strings: elements here would defeat Registrar's
// deep-equal registration guard (Maximum update depth) — the AbsenzBadge
// is attached at render time from is_absenz
type NavData = {
  id: string
  label: string | null
  is_absenz?: boolean | null
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
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const [filterToAssess] = useUrlFilter('observationsToAssess')
  const [filterNotToAssign] = useUrlFilter('observationsNotToAssign')
  const location = useLocation()
  const { formatMessage } = useIntl()

  const filter =
    isToAssess ? filterToAssess
    : isNotToAssign ? filterNotToAssign
    : []
  const area = useProjectAreaFilter(projectId)
  const filterString = andFilters(filterStringFromFilter(filter, 'o'), area.matches('o'))
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
    ...(isToAssess ? ['observations-to-assess']
    : isNotToAssign ? ['observations-not-to-assign']
    : ['observations']),
  ]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))

  const res = useLiveQuery<NavData[number]>(
    spatialListQuery({
      open: isOpen, select: 'o.observation_id AS id, o.label, o.absence AS is_absenz',
      from: 'observations o JOIN observation_imports oi USING (observation_import_id)',
      where: baseFilter, filter: filterString,
    }),
  )

  const loading = res === undefined

  const navs: NavData = res?.rows.filter((row) => row.id) ?? []
  const countUnfiltered = res?.rows[0]?.count_unfiltered ?? 0
  const countFiltered = res?.rows[0]?.count_filtered ?? 0
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)
  const namePlural =
    isToAssess ?
      formatMessage({
        id: 'BEylmv',
        defaultMessage: 'Beobachtungen zu beurteilen',
      })
    : isNotToAssign ?
      formatMessage({
        id: 'slC/ul',
        defaultMessage: 'Beobachtungen nicht zuzuordnen',
      })
    : formatMessage({
        id: 'OaXR/X',
        defaultMessage: 'Beobachtungen zugeordnet',
      })
  const nameSingular =
    isToAssess ?
      formatMessage({
        id: 'tfUHK5',
        defaultMessage: 'Beobachtung zu beurteilen',
      })
    : isNotToAssign ?
      formatMessage({
        id: 'aanYYz',
        defaultMessage: 'Beobachtung nicht zuzuordnen',
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
