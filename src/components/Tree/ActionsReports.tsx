import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ActionReportNode } from './ActionReport'
import { Places as Place } from '../../generated/client'

type Props = {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  action_id: string
  level?: number
}

export const ActionReportsNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    level = 9,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()

    const { db } = useElectric()!
    const { results: actionReports = [] } = useLiveQuery(
      db.action_reports.liveMany({
        where: { deleted: false, action_id },
        orderBy: { label: 'asc' },
      }),
    )

    const actionReportsNode = useMemo(
      () => ({ label: `Reports (${actionReports.length})` }),
      [actionReports.length],
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
        urlPath[10] === 'reports'
      : isOpenBase &&
        urlPath[6] === 'actions' &&
        urlPath[7] === action_id &&
        urlPath[8] === 'reports'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/actions/${action_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/reports`)
    }, [baseUrl, isOpen, navigate])

    return (
      <>
        <Node
          node={actionReportsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={actionReports.length}
          to={`${baseUrl}/reports`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          actionReports.map((actionReport) => (
            <ActionReportNode
              key={actionReport.action_report_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              action_id={action_id}
              actionReport={actionReport}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
