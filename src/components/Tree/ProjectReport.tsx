import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { ProjectReports as ProjectReport } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  projectReport: ProjectReport
  level?: number
}

export const ProjectReportNode = memo(
  ({ project_id, projectReport, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'reports' &&
      urlPath[3] === projectReport.project_report_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/reports`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${projectReport.project_report_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      projectReport.project_report_id,
      searchParams,
    ])

    return (
      <Node
        node={projectReport}
        id={projectReport.project_report_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${projectReport.project_report_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
