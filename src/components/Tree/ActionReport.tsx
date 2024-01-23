import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { ActionReportValuesNode } from './ActionsReportValues'

export const ActionReportNode = ({
  project_id,
  subproject_id,
  place_id,
  place,
  action_id,
  actionReport,
  level = 10,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

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
      urlPath[11] === actionReport.action_report_id
    : isOpenBase &&
      urlPath[6] === 'actions' &&
      urlPath[7] === action_id &&
      urlPath[8] === 'reports' &&
      urlPath[9] === actionReport.action_report_id
  const isActive = isOpen && urlPath.length === level

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
    place_id ?? place.place_id
  }${place_id ? `/places/${place.place_id}` : ''}/actions/${action_id}/reports`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/${actionReport.action_report_id}`)
  }, [isOpen, navigate, baseUrl, actionReport.action_report_id])

  return (
    <>
      <Node
        node={actionReport}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={1}
        to={`${baseUrl}/${actionReport.action_report_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <ActionReportValuesNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id}
          place={place}
          action_id={action_id}
          action_report_id={actionReport.action_report_id}
          level={level + 1}
        />
      )}
    </>
  )
}
