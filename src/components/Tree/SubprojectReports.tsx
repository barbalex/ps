import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { SubprojectReportNode } from './SubprojectReport.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

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
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: subprojectReports = [] } = useLiveQuery(
      db.subproject_reports.liveMany({
        where: { subproject_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
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

    const baseArray = useMemo(
      () => ['projects', project_id, 'subprojects', subproject_id],
      [project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'reports'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/reports`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      baseArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      searchParams,
    ])

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
