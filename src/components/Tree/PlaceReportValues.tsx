import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { PlaceReportValueNode } from './PlaceReportValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

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

    // TODO: get name by place_level
    const placeReportValuesNode = useMemo(
      () => ({ label: `Values (${placeReportValues.length})` }),
      [placeReportValues.length],
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
        urlPath[10] === 'values'
      : isOpenBase &&
        urlPath[6] === 'reports' &&
        urlPath[7] === place_report_id &&
        urlPath[8] === 'values'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/reports/${place_report_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/values`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={placeReportValuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={placeReportValues.length}
          to={`${baseUrl}/values`}
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
