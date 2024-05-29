import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import {
  PlaceReportValues as PlaceReportValue,
  Places as Place,
} from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  place: Place
  place_report_id: string
  placeReportValue: PlaceReportValue
  level?: number
}

export const PlaceReportValueNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    place_report_id,
    placeReportValue,
    level = 10,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpenBase =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'places' &&
      urlPath[6] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[7] === 'places' &&
        urlPath[8] === place.place_id &&
        urlPath[9] === 'reports' &&
        urlPath[10] === place_report_id &&
        urlPath[11] === 'values' &&
        urlPath[12] === placeReportValue.place_report_value_id
      : isOpenBase &&
        urlPath[7] === 'reports' &&
        urlPath[8] === place_report_id &&
        urlPath[9] === 'values' &&
        urlPath[10] === placeReportValue.place_report_value_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
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
        'values',
      ],
      [project_id, subproject_id, place_id, place.place_id, place_report_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, placeReportValue.place_report_value_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${placeReportValue.place_report_value_id}`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      baseArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      placeReportValue.place_report_value_id,
      searchParams,
    ])

    return (
      <Node
        node={placeReportValue}
        id={placeReportValue.place_report_value_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${placeReportValue.place_report_value_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
