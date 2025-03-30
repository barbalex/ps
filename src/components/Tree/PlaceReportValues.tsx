import { useCallback, useMemo, memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { PlaceReportValueNode } from './PlaceReportValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  place: Place
  placeReportId: string
  level?: number
}

export const PlaceReportValuesNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    place,
    placeReportId,
    level = 9,
  }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()

    const res = useLiveIncrementalQuery(
      `
      SELECT
        place_report_value_id,
        label
      FROM place_report_values 
      WHERE place_report_id = $1 
      ORDER BY label`,
      [placeReportId],
      'place_report_value_id',
    )
    const rows = res?.rows ?? []
    const loading = res === undefined

    // TODO: get name by place_level
    const node = useMemo(
      () => ({
        label: `Values (${loading ? '...' : formatNumber(rows.length)})`,
      }),
      [loading, rows.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'places',
        placeId ?? place.place_id,
        ...(placeId ? ['places', place.place_id] : []),
        'reports',
        placeReportId,
      ],
      [place.place_id, placeId, placeReportId, projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'values'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({ node: ownArray })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({ to: parentUrl })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({ nodes: [ownArray] })
    }, [
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentUrl,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={rows.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          rows.map((placeReportValue) => (
            <PlaceReportValueNode
              key={placeReportValue.place_report_value_id}
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              place={place}
              placeReportId={placeReportId}
              placeReportValue={placeReportValue}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
