import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ActionReportValues as ActionReportValue } from '../../../generated/client'
import { ActionReportValueNode } from './ActionReportValue'

export const ActionReportValuesNode = ({
  project_id,
  subproject_id,
  place_id,
  place,
  action_id,
  action_report_id,
  level = 11,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.action_report_values.liveMany({
      where: { deleted: false, action_report_id },
      orderBy: { label: 'asc' },
    }),
  )
  const actionReportValues: ActionReportValue[] = results ?? []

  const actionReportValuesNode = useMemo(
    () => ({
      label: `Values (${actionReportValues.length})`,
    }),
    [actionReportValues.length],
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
      urlPath[8] === 'actions' &&
      urlPath[9] === action_id &&
      urlPath[10] === 'reports' &&
      urlPath[11] === action_report_id &&
      urlPath[12] === 'values'
    : isOpenBase &&
      urlPath[6] === 'actions' &&
      urlPath[7] === action_id &&
      urlPath[8] === 'reports' &&
      urlPath[9] === action_report_id &&
      urlPath[10] === 'values'
  const isActive = isOpen && urlPath.length === level

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
    place_id ?? place.place_id
  }${
    place_id ? `/places/${place.place_id}` : ''
  }/actions/${action_id}/reports/${action_report_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/values`)
  }, [baseUrl, isOpen, navigate])

  return (
    <>
      <Node
        node={actionReportValuesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={actionReportValues.length}
        to={`${baseUrl}/values`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        actionReportValues.map((actionReportValue) => (
          <ActionReportValueNode
            key={actionReportValue.action_report_value_id}
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            action_id={action_id}
            action_report_id={action_report_id}
            actionReportValue={actionReportValue}
            level={level + 1}
          />
        ))}
    </>
  )
}
