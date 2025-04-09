import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

export const useActionReportValueNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  actionReportId,
  actionReportValueId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        action_report_value_id as id,
        label
      FROM action_report_values 
      WHERE action_report_value_id = $1`,
    [actionReportValueId],
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
      'actions',
      actionId,
      'reports',
      actionReportId,
      'values',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, actionReportValueId]
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
      nameSingular: 'Action Report Value',
    }
  }, [
    actionId,
    actionReportId,
    actionReportValueId,
    location.pathname,
    openNodes,
    placeId,
    placeId2,
    projectId,
    res?.rows,
    subprojectId,
  ])

  return { loading, navData }
}
