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
  action_taxa_count: number
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
        action_taxa_count AS (SELECT count(*) FROM action_taxa WHERE action_id = '${actionId}'),
        files_count AS (SELECT count(*) FROM files WHERE action_id = '${actionId}')
      SELECT
        action_id AS id,
        label,
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
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const resPlaceLevel = useLiveQuery(
    `SELECT action_quantities, action_quantities_in_action, action_taxa, action_taxa_in_action, action_files, action_files_in_action FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = resPlaceLevel?.rows?.[0]
  const quantitiesInAction = placeLevel?.action_quantities_in_action !== false
  const taxaInAction = placeLevel?.action_taxa_in_action !== false
  const filesInAction =
    (isDesigning || placeLevel?.action_files !== false) &&
    placeLevel?.action_files_in_action !== false
  const allInline = quantitiesInAction && taxaInAction && filesInAction

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
      ...(!allInline
        ? [
            {
              id: 'action',
              label: formatMessage({ id: 'upa2nh', defaultMessage: 'Massnahme' }),
            },
          ]
        : []),
      ...(!quantitiesInAction &&
      (isDesigning || placeLevel?.action_quantities !== false)
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
      ...(!taxaInAction && (isDesigning || placeLevel?.action_taxa !== false)
        ? [
            {
              id: 'taxa',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.action_taxa_count ?? 0,
                namePlural: formatMessage({
                  id: '7sVbg1',
                  defaultMessage: 'Taxa',
                }),
              }),
            },
          ]
        : []),
      ...(!filesInAction && (isDesigning || placeLevel?.action_files !== false)
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
