import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

export const usePlaceReportValueNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  placeReportId,
  placeReportValueId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        place_report_value_id AS id,
        label
      FROM place_report_values 
      WHERE place_report_value_id = $1`,
    [placeReportValueId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]
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
      'values',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, placeReportValueId]
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label: nav?.label ?? nav?.id,
      nameSingular: 'Place Report Value',
    }
  }, [
    location.pathname,
    openNodes,
    placeId,
    placeId2,
    placeReportId,
    placeReportValueId,
    projectId,
    res?.rows,
    subprojectId,
  ])

  return { loading, navData }
}
