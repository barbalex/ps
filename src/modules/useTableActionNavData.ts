import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesSetAtom, languageAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  tableViewId: string
  actionId: string
}

type NavData = {
  action_id: string
  label: string
  action_quantities_count: number
  action_taxa_count: number
  files_count: number
}

type ViewData = {
  name_singular_de: string | null
  name_singular_en: string | null
  name_singular_fr: string | null
  name_singular_it: string | null
  label_by: unknown
}

export const useTableActionNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  tableViewId,
  actionId,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()

  const resView = useLiveQuery<ViewData>(
    `SELECT name_singular_de, name_singular_en, name_singular_fr, name_singular_it, label_by FROM table_views WHERE table_view_id = $1`,
    [tableViewId],
  )
  const view = resView?.rows?.[0]
  const viewNameSingular =
    view?.[`name_singular_${language}`] ?? view?.name_singular_de
  const labelBy = (view?.label_by ?? []) as string[]

  // rows are labeled in apf2 manner: 4-digit year, then the value of each
  // field in label_by, separated by ": " — e.g. "2019: Kontrolle"
  const viewLabelSql = `coalesce(lpad(extract(year from actions.date)::text, 4, '0'), '(kein Jahr)')${labelBy
    .map(
      (field) =>
        ` || ': ' || coalesce(actions.data->>'${field}', '(kein ${field.charAt(0).toUpperCase()}${field.slice(1)})')`,
    )
    .join('')}`

  const sql = `
      WITH
        action_quantities_count AS (SELECT count(*) FROM action_quantities WHERE action_id = '${actionId}'),
        action_taxa_count AS (SELECT count(*) FROM action_taxa WHERE action_id = '${actionId}'),
        files_count AS (SELECT count(*) FROM files WHERE action_id = '${actionId}')
      SELECT
        action_id,
        ${viewLabelSql} AS label,
        action_quantities_count.count AS action_quantities_count,
        action_taxa_count.count AS action_taxa_count,
        files_count.count AS files_count
      FROM
        actions,
        action_quantities_count,
        action_taxa_count,
        files_count
      WHERE
        actions.action_id = '${actionId}'`
  const res = useLiveQuery<NavData>(sql)
  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'table-views',
    tableViewId,
    'actions',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.action_id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.action_id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label,
    notFound,
    nameSingular: viewNameSingular,
    navs: [],
  }

  return { navData, loading }
}
