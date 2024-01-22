import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { PlaceReportValues as PlaceReportValue } from '../../../generated/client'
import { PlaceReportValueNode } from './PlaceReportValue'

export const PlaceReportValuesNode = ({
  project_id,
  subproject_id,
  place_id,
  place_report_id,
  level = 9,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.place_report_values.liveMany({
      where: { deleted: false, place_report_id },
      orderBy: { label: 'asc' },
    }),
  )
  const placeReportValues: PlaceReportValue[] = results ?? []

  // TODO: get name by place_level
  const placeReportValuesNode = useMemo(
    () => ({
      label: `Values (${placeReportValues.length})`,
    }),
    [placeReportValues.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'places' &&
    urlPath[5] === place_id &&
    urlPath[6] === 'reports' &&
    urlPath[7] === place_report_id &&
    urlPath[8] === 'values'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}/values`,
    )
  }, [isOpen, navigate, place_id, place_report_id, project_id, subproject_id])

  return (
    <>
      <Node
        node={placeReportValuesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={placeReportValues.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}/values`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        placeReportValues.map((placeReportValue) => (
          <PlaceReportValueNode
            key={placeReportValue.place_report_value_id}
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            placeReportValue={placeReportValue}
          />
        ))}
    </>
  )
}
