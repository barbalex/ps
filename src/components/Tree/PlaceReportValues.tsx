import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { PlaceReportValueNode } from './PlaceReportValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  place_report_id: string
  level?: number
}

export const PlaceReportValuesNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    place_report_id,
    level = 9,
  }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: placeReportValues = [] } = useLiveQuery(
      db.place_report_values.liveMany({
        where: { place_report_id },
        orderBy: { label: 'asc' },
      }),
    )

    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    // TODO: get name by place_level
    const placeReportValuesNode = useMemo(
      () => ({ label: `Values (${placeReportValues.length})` }),
      [placeReportValues.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
        'reports',
        place_report_id,
      ],
      [place.place_id, place_id, place_report_id, project_id, subproject_id],
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
        removeChildNodes({
          node: parentArray,
          db,
          appStateId: appState?.app_state_id,
        })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
          })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({
        nodes: [ownArray],
        db,
        appStateId: appState?.app_state_id,
      })
    }, [
      appState?.app_state_id,
      db,
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={placeReportValuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={placeReportValues.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          placeReportValues.map((placeReportValue) => (
            <PlaceReportValueNode
              key={placeReportValue.place_report_value_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              place_report_id={place_report_id}
              placeReportValue={placeReportValue}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
