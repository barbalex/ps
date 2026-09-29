import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filteredViewsFilterAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
}

type NavData = {
  id: string
  label: string
  table_name: string | null
}[]

export const useFilteredViewsNavData = ({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const [filter] = useAtom(filteredViewsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery<NavData[number]>(
    `
    SELECT
      filtered_view_id AS id,
      label,
      table_name
    FROM filtered_views
    WHERE project_id = $1
      ${isFiltered ? `AND (${filterString})` : ''}
    ORDER BY sort, label`,
    [projectId],
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'filtered-views']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
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
      countFiltered: navs.length,
      countUnfiltered: navs.length,
      namePlural: formatMessage({
        id: '2kHq3x',
        defaultMessage: 'Gefilterte Ansichten',
      }),
      loading,
    }),
    nameSingular: formatMessage({
      id: '5mN8vP',
      defaultMessage: 'Gefilterte Ansicht',
    }),
    navs,
  }

  return { loading, navData, isFiltered }
}
