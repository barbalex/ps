import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  placeReportId: string
}

type NavData = {
  id: string
  label: string | null
}

export const usePlaceReportReportNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  placeReportId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { formatMessage } = useIntl()

  const placeReportQuery = useLiveQuery(/* sql */ `
    SELECT
      label,
      place_report_id as id
    FROM place_reports
    WHERE place_report_id = '${placeReportId}'`)
  const placeReport = placeReportQuery?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'reports',
    placeReportId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'report']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!placeReportQuery && !placeReport
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : formatMessage({ id: 'Z8jucQ', defaultMessage: 'Bericht' })

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
    navs: [],
  }

  const loading = placeReportQuery === undefined

  return { navData, loading }
}
