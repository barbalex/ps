import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom, languageAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  filteredViewId: string
  checkId: string
}

type NavData = {
  check_id: string
  label: string
  check_quantities_count: number
  check_taxa_count: number
  files_count: number
}

type ViewData = {
  name_singular_de: string | null
  name_singular_en: string | null
  name_singular_fr: string | null
  name_singular_it: string | null
}

export const useFilteredCheckNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  filteredViewId,
  checkId,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)

  const sql = `
      WITH
        check_quantities_count AS (SELECT count(*) FROM check_quantities WHERE check_id = '${checkId}'),
        check_taxa_count AS (SELECT count(*) FROM check_taxa WHERE check_id = '${checkId}'),
        files_count AS (SELECT count(*) FROM files WHERE check_id = '${checkId}')
      SELECT
        check_id,
        label,
        check_quantities_count.count AS check_quantities_count,
        check_taxa_count.count AS check_taxa_count,
        files_count.count AS files_count
      FROM
        checks,
        check_quantities_count,
        check_taxa_count,
        files_count
      WHERE
        checks.check_id = '${checkId}'`
  const res = useLiveQuery<NavData>(sql)
  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const resView = useLiveQuery<ViewData>(
    `SELECT name_singular_de, name_singular_en, name_singular_fr, name_singular_it FROM filtered_views WHERE filtered_view_id = $1`,
    [filteredViewId],
  )
  const view = resView?.rows?.[0]
  const viewNameSingular =
    view?.[`name_singular_${language}`] ?? view?.name_singular_de

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'filtered-checks',
    filteredViewId,
    'checks',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.check_id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.check_id)

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
