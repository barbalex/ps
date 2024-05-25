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
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places' &&
      urlPath[5] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[6] === 'places' &&
        urlPath[7] === place.place_id &&
        urlPath[8] === 'reports' &&
        urlPath[9] === place_report_id &&
        urlPath[10] === 'values' &&
        urlPath[11] === placeReportValue.place_report_value_id
      : isOpenBase &&
        urlPath[6] === 'reports' &&
        urlPath[7] === place_report_id &&
        urlPath[8] === 'values' &&
        urlPath[9] === placeReportValue.place_report_value_id
    const isActive = isOpen && urlPath.length === level

    const baseArray = useMemo(
      () => [
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
