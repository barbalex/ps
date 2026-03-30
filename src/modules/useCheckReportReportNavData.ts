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
  checkReportId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useCheckReportReportNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  checkReportId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { formatMessage } = useIntl()

  const checkReportQuery = useLiveQuery(/* sql */ `
    SELECT
      label,
      place_check_report_id as id
    FROM check_reports
    WHERE place_check_report_id = '${checkReportId}'`)
  const checkReport = checkReportQuery?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'check-reports',
    checkReportId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'report']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!checkReportQuery && !checkReport
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

  const loading = checkReportQuery === undefined

  return { navData, loading }
}
