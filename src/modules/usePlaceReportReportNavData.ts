import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId_: string
  subprojectId_: string
  placeId_: string
  placeId2_?: string
  placeReportId_: string
}

type NavData = {
  id: string
  label: string | null
}

export const usePlaceReportReportNavData = ({
  projectId_,
  subprojectId_,
  placeId_,
  placeId2_,
  placeReportId_,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const projectId = projectId_?.replace(/_/g, '-')
  const subprojectId = subprojectId_?.replace(/_/g, '-')
  const placeId = placeId_?.replace(/_/g, '-')
  const placeId2 = placeId2_?.replace(/_/g, '-')
  const placeReportId = placeReportId_?.replace(/_/g, '-')

  const placeReportQuery = useLiveQuery(/* sql */ `
    SELECT
      name as label,
      place_report_id as id
    FROM place_reports
    WHERE place_report_id = '${placeReportId}'`)
  const placeReport = placeReportQuery?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId_,
    'subprojects',
    subprojectId_,
    'places',
    placeId_,
    ...(placeId2_ ? ['places', placeId2_] : []),
    'reports',
    placeReportId_,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'report']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!placeReportQuery && !placeReport
  const label = notFound ? 'Not Found' : 'Report'

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
