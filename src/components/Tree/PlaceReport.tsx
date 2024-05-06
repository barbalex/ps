import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import {
  PlaceReports as PlaceReport,
  Places as Place,
} from '../../../generated/client/index.ts'
import { PlaceReportValuesNode } from './PlaceReportValues'

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

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/reports`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${placeReport.place_report_id}`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, placeReport.place_report_id, searchParams])

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
