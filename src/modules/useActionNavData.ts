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
  actionId: string
}

type NavData = {
  id: string
  label: string
  action_quantities_count: number
  action_reports_count: number
  files_count: number
}

export const useActionNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [isDesigning] = useAtom(designingAtom)

  const sql = `
      WITH
        action_quantities_count AS (SELECT count(*) FROM action_quantities WHERE action_id = '${actionId}'),
        action_reports_count AS (SELECT count(*) FROM action_reports WHERE action_id = '${actionId}'),
        files_count AS (SELECT count(*) FROM files WHERE action_id = '${actionId}')
      SELECT
        action_id AS id,
        label,
        action_quantities_count.count AS action_quantities_count,
        action_reports_count.count AS action_reports_count,
        files_count.count AS files_count
      FROM 
        actions,
        action_quantities_count,
        action_reports_count,
        files_count
      WHERE 
        actions.action_id = '${actionId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const resPlaceLevel = useLiveQuery(
    `SELECT action_quantities, action_quantities_in_action, action_reports, action_files FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = resPlaceLevel?.rows?.[0]
  const quantitiesInAction = placeLevel?.action_quantities_in_action !== false

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'actions',
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
        id: 'action',
        label: formatMessage({ id: 'upa2nh', defaultMessage: 'Massnahme' }),
      },
      ...(!quantitiesInAction && (isDesigning || placeLevel?.action_quantities !== false)
        ? [
            {
              id: 'quantities',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.action_quantities_count ?? 0,
                namePlural: formatMessage({
                  id: 'Xuj/Gy',
                  defaultMessage: 'Mengen',
                }),
              }),
            },
          ]
        : []),
      ...(isDesigning || placeLevel?.action_reports !== false
        ? [
            {
              id: 'reports',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.action_reports_count ?? 0,
                namePlural: formatMessage({
                  id: 'CiJ0SG',
                  defaultMessage: 'Berichte',
                }),
              }),
            },
          ]
        : []),
      ...(isDesigning || placeLevel?.action_files !== false
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
