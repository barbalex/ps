import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { ProjectReports as ProjectReport } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  projectReport: ProjectReport
  level?: number
}

export const ProjectReportNode = memo(
  ({ project_id, projectReport, level = 4 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'reports' &&
      urlPath[4] === projectReport.project_report_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => ['data', 'projects', project_id, 'reports'],
      [project_id],
    )
    const baseUrl = baseArray.join('/')

    return (
      <Node
        node={projectReport}
        id={projectReport.project_report_id}
        level={level}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${projectReport.project_report_id}`}
      />
    )
  },
)
