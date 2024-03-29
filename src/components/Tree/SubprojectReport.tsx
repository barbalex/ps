import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { SubprojectReports as SubprojectReport } from '../../../generated/client'

interface Props {
  project_id: string
  subproject_id: string
  subprojectReport: SubprojectReport
  level?: number
}

export const SubprojectReportNode = memo(
  ({ project_id, subproject_id, subprojectReport, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'reports' &&
      urlPath[5] === subprojectReport.subproject_report_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/reports`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${subprojectReport.subproject_report_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      subprojectReport.subproject_report_id,
      searchParams,
    ])

    return (
      <Node
        node={subprojectReport}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`${baseUrl}/${subprojectReport.subproject_report_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
