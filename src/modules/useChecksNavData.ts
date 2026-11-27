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
  placeId: string
  placeId2?: string
}

type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

export const useChecksNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
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
  const ownArray = [...parentArray, 'checks']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))

  const [filter] = useUrlFilter(placeId2 ? 'checks2' : 'checks1')
  const area = useProjectAreaFilter(projectId)
  const filterString = andFilters(filterStringFromFilter(filter), area.matches('checks'))
  const isFiltered = !!filterString

  const sql = spatialListQuery({
    open: isOpen, select: 'check_id AS id, label', from: 'checks',
    where: `place_id = '${placeId2 ?? placeId}'`, filter: filterString,
  })
  const res = useLiveQuery<NavData[number]>(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows.filter((row) => row.id) ?? []
  const countUnfiltered = res?.rows[0]?.count_unfiltered ?? 0
  const countFiltered = res?.rows[0]?.count_filtered ?? 0

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
      namePlural: formatMessage({ id: 'oPMDm+', defaultMessage: 'Kontrollen' }),
    }),
    nameSingular: formatMessage({ id: 'ZCwpER', defaultMessage: 'Kontrolle' }),
    navs,
  }

  return { loading, navData, isFiltered }
}
