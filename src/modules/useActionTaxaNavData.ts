import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  tableViewId?: string
  actionId: string
}

type NavData = {
  id: string
  label: string
}[]

export const useActionTaxaNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  tableViewId,
  actionId,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const location = useLocation()

  const res = useLiveQuery<NavData[number]>(
    `
      SELECT
        action_taxon_id as id,
        label
      FROM action_taxa 
      WHERE action_id = $1 
      ORDER BY label`,
    [actionId],
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    ...(tableViewId ? ['table-views', tableViewId] : []),
    'actions',
    actionId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'taxa']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodesSet.has(ownArray.join('/'))
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
      namePlural: formatMessage({ id: '7sVbg1', defaultMessage: 'Taxa' }),
      loading,
    }),
    nameSingular: formatMessage({
      id: 'mN1OpQ',
      defaultMessage: 'Massnahmen-Taxon',
    }),
    navs,
  }

  return { loading, navData }
}
