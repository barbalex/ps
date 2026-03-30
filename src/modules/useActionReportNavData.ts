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
  actionReportId: string
}

type NavData = {
  id: string
  label: string | null
  place_action_report_quantities_count: number
}

export const useActionReportNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionReportId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [isDesigning] = useAtom(designingAtom)
  const { formatMessage } = useIntl()

  const sql = `
      WITH
        place_action_report_quantities_count AS (SELECT count(*) FROM action_report_quantities WHERE place_action_report_id = '${actionReportId}')
      SELECT
        place_action_report_id AS id,
        label,
        place_action_report_quantities_count.count AS place_action_report_quantities_count
      FROM 
        action_reports,
        place_action_report_quantities_count
      WHERE 
        action_reports.place_action_report_id = '${actionReportId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const resPlaceLevel = useLiveQuery(
    `SELECT action_report_quantities, action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = $2`,
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
    'action-reports',
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
    navs:
      placeLevel?.action_report_quantities_in_report === false
        ? [
            {
              id: 'report',
              label: formatMessage({ id: 'Z8jucQ', defaultMessage: 'Bericht' }),
            },
            ...(isDesigning || placeLevel?.action_report_quantities !== false
              ? [
                  {
                    id: 'quantities',
                    label: buildNavLabel({
                      loading,
                      countFiltered: nav?.place_action_report_quantities_count ?? 0,
                      namePlural: formatMessage({
                        id: 'Xuj/Gy',
                        defaultMessage: 'Mengen',
                      }),
                    }),
                  },
                ]
              : []),
          ]
        : [],
  }

  return { navData, loading }
}
