import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { SubprojectReportNode } from './SubprojectReport'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const SubprojectReportsNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { db } = useElectric()!
    const { results: subprojectReports = [] } = useLiveQuery(
      db.subproject_reports.liveMany({
        where: { deleted: false, subproject_id },
        orderBy: { label: 'asc' },
      }),
    )

    const subprojectReportsNode = useMemo(
      () => ({ label: `Reports (${subprojectReports.length})` }),
      [subprojectReports.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'reports'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/reports`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={subprojectReportsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={subprojectReports.length}
          to={`${baseUrl}/reports`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          subprojectReports.map((subprojectReport) => (
            <SubprojectReportNode
              key={subprojectReport.subproject_report_id}
              project_id={project_id}
              subproject_id={subproject_id}
              subprojectReport={subprojectReport}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
