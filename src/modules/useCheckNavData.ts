import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom, designingAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  checkId: string
}

type NavData = {
  id: string
  label: string
  check_quantities_count: number
  check_reports_count: number
  check_taxa_count: number
  files_count: number
}

export const useCheckNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  checkId,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [isDesigning] = useAtom(designingAtom)

  const sql = `
      WITH
        check_quantities_count AS (SELECT count(*) FROM check_quantities WHERE check_id = '${checkId}'),
        check_reports_count AS (SELECT count(*) FROM check_reports WHERE check_id = '${checkId}'),
        check_taxa_count AS (SELECT count(*) FROM check_taxa WHERE check_id = '${checkId}'),
        files_count AS (SELECT count(*) FROM files WHERE check_id = '${checkId}')
      SELECT
        check_id AS id,
        label,
        check_quantities_count.count AS check_quantities_count,
        check_reports_count.count AS check_reports_count,
        check_taxa_count.count AS check_taxa_count,
        files_count.count AS files_count
      FROM 
        checks,
        check_quantities_count,
        check_reports_count,
        check_taxa_count,
        files_count
      WHERE 
        checks.check_id = '${checkId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const resPlaceLevel = useLiveQuery(
    `SELECT check_quantities, check_reports, check_taxa, check_files FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = resPlaceLevel?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'checks',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 2,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label,
    notFound,
    navs: [
      {
        id: 'check',
        label: formatMessage({ id: 'ZCwpER', defaultMessage: 'Kontrolle' }),
      },
      ...(isDesigning || placeLevel?.check_quantities !== false
        ? [
            {
              id: 'quantities',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.check_quantities_count ?? 0,
                namePlural: formatMessage({
                  id: 'Xuj/Gy',
                  defaultMessage: 'Mengen',
                }),
              }),
            },
          ]
        : []),
      ...(isDesigning || placeLevel?.check_reports !== false
        ? [
            {
              id: 'reports',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.check_reports_count ?? 0,
                namePlural: formatMessage({
                  id: 'CiJ0SG',
                  defaultMessage: 'Berichte',
                }),
              }),
            },
          ]
        : []),
      ...(isDesigning || placeLevel?.check_taxa !== false
        ? [
            {
              id: 'taxa',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.check_taxa_count ?? 0,
                namePlural: formatMessage({
                  id: '7sVbg1',
                  defaultMessage: 'Taxa',
                }),
              }),
            },
          ]
        : []),
      ...(isDesigning || placeLevel?.check_files !== false
        ? [
            {
              id: 'files',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.files_count ?? 0,
                namePlural: formatMessage({
                  id: 'mn58Sh',
                  defaultMessage: 'Dateien',
                }),
              }),
            },
          ]
        : []),
    ],
  }

  return { navData, loading }
}
