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
        check_taxa_count AS (SELECT count(*) FROM check_taxa WHERE check_id = '${checkId}'),
        files_count AS (SELECT count(*) FROM files WHERE check_id = '${checkId}')
      SELECT
        check_id AS id,
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
  const res = useLiveQuery(sql)
  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const resPlaceLevel = useLiveQuery(
    `SELECT check_quantities, check_quantities_in_check, check_taxa, check_taxa_in_check, check_files, check_files_in_check FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = resPlaceLevel?.rows?.[0]
  const quantitiesInCheck = placeLevel?.check_quantities_in_check !== false
  const taxaInCheck = placeLevel?.check_taxa_in_check !== false
  const filesInCheck =
    (isDesigning || placeLevel?.check_files !== false) &&
    placeLevel?.check_files_in_check !== false

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

  const showQuantitiesNav =
    !quantitiesInCheck && (isDesigning || placeLevel?.check_quantities !== false)
  const showTaxaNav =
    !taxaInCheck && (isDesigning || placeLevel?.check_taxa !== false)
  const showFilesNav =
    !filesInCheck && (isDesigning || placeLevel?.check_files !== false)
  // When all child items are shown inline (or disabled), the check form renders
  // at the check's root URL — no need for a separate 'check' sub-nav entry
  const allInline = !showQuantitiesNav && !showTaxaNav && !showFilesNav

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
      ...(!allInline
        ? [
            {
              id: 'check',
              label: formatMessage({
                id: 'ZCwpER',
                defaultMessage: 'Kontrolle',
              }),
            },
          ]
        : []),
      ...(showQuantitiesNav
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
      ...(showTaxaNav
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
      ...(showFilesNav
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
