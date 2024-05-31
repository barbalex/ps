import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { SubprojectReports as SubprojectReport } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  subprojectReport: SubprojectReport
  level?: number
}

export const SubprojectReportNode = memo(
  ({ project_id, subproject_id, subprojectReport, level = 6 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'reports',
        subprojectReport.subproject_report_id,
      ],
      [project_id, subprojectReport.subproject_report_id, subproject_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={subprojectReport}
        id={subprojectReport.subproject_report_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
