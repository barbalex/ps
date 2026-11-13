import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { tableViewTableLabel } from './tableViewTables.ts'
import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
  /** when given, the nav data describes the field groups of that one
   * table (per-table list, breadcrumbs); otherwise all groups */
  tableName?: string
}

type NavData = {
  id: string
  label: string
  table_name: string | null
}[]

export const useFieldGroupsNavData = ({ projectId, tableName }: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData[number]>(
    `
    SELECT
      field_group_id AS id,
      label,
      table_name
    FROM field_groups
    WHERE project_id = $1
      ${tableName ? `AND table_name = $2` : ''}
    ORDER BY label`,
    tableName ? [projectId, tableName] : [projectId],
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [
    ...parentArray,
    'field-groups',
    ...(tableName ? [tableName] : []),
  ]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const namePlural =
    tableName ?
      `${formatMessage({ id: 'zP3kM9', defaultMessage: 'Feldergruppen' })} (${tableViewTableLabel(tableName, formatMessage)})`
    : formatMessage({
        id: 'zP3kM9',
        defaultMessage: 'Feldergruppen',
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
      countFiltered: navs.length,
      countUnfiltered: navs.length,
      namePlural,
      loading,
    }),
    nameSingular: formatMessage({
      id: 'vN8wL2',
      defaultMessage: 'Feldergruppe',
    }),
    navs,
  }

  return { loading, navData }
}
