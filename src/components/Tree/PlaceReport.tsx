import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import {
  PlaceReports as PlaceReport,
  Places as Place,
} from '../../../generated/client/index.ts'
import { PlaceReportValuesNode } from './PlaceReportValues.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  placeReport: PlaceReport
  level?: number
}

export const PlaceReportNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    placeReport,
    level = 8,
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
        urlPath[9] === placeReport.place_report_id
      : isOpenBase &&
        urlPath[6] === 'reports' &&
        urlPath[7] === placeReport.place_report_id
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
      ],
      [project_id, subproject_id, place_id, place.place_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, placeReport.place_report_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${placeReport.place_report_id}`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      baseArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      placeReport.place_report_id,
      searchParams,
    ])

    return (
      <>
        <Node
          node={placeReport}
          id={placeReport.place_report_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={10}
          to={`${baseUrl}/${placeReport.place_report_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <PlaceReportValuesNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            place_report_id={placeReport.place_report_id}
            level={level + 1}
          />
        )}
      </>
    )
  },
)
