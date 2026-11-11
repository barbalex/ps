import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { tableViewTableLabel } from './tableViewTables.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  /** when given, the nav data describes the views of that one table
   * (per-table list, breadcrumbs); otherwise all views (design tree) */
  tableName?: string
}

type NavData = {
  // multi-segment when all tables are shown: '<table_name>/<table_view_id>'
  id: string
  label: string
  table_name: string | null
}[]

export const useTableViewsNavData = ({ projectId, tableName }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData[number]>(
    `
    SELECT
      table_view_id AS id,
      label,
      table_name
    FROM table_views
    WHERE project_id = $1
      ${tableName ? `AND table_name = $2` : ''}
    ORDER BY sort, label`,
    tableName ? [projectId, tableName] : [projectId],
  )

  const loading = res === undefined

  const navsRaw: NavData = res?.rows ?? []
  // within one table the id is the view id; across tables it carries the
  // table name so tree urls resolve to /table-views/<table_name>/<view_id>
  const navs: NavData = navsRaw.map((nav) => ({
    ...nav,
    id: tableName ? nav.id : `${nav.table_name ?? ''}/${nav.id}`,
  }))
  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [
    ...parentArray,
    'table-views',
    ...(tableName ? [tableName] : []),
  ]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const namePlural = tableName
    ? tableViewTableLabel(tableName, formatMessage)
    : formatMessage({
        id: '2kHq3x',
        defaultMessage: 'Ansichten',
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
      id: '5mN8vP',
      defaultMessage: 'Ansicht',
    }),
    navs,
  }

  return { loading, navData }
}
