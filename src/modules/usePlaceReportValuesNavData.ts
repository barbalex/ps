import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

export const usePlaceReportValuesNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  placeReportId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        place_report_value_id AS id,
        label
      FROM place_report_values 
      WHERE place_report_id = $1 
      ORDER BY label`,
    [placeReportId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
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
    const ownArray = [...parentArray, 'values']
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
      label: buildNavLabel({
        countFiltered: navs.length,
        namePlural: 'Values',
        loading,
      }),
      nameSingular: 'Place Report Value',
      navs,
    }
  }, [
    loading,
    location.pathname,
    openNodes,
    placeId,
    placeId2,
    placeReportId,
    projectId,
    res?.rows,
    subprojectId,
  ])

  return { loading, navData }
}
