import { useParams, useNavigate } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createProjectReportDesign } from '../modules/createRows.ts'
import { useProjectReportDesignsNavData } from '../modules/useProjectReportDesignsNavData.ts'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'


export const ProjectReportDesigns = () => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData } = useProjectReportDesignsNavData({
    projectId: projectId!,  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const project_report_design_id = await createProjectReportDesign({
      projectId: projectId!,    })
    if (!project_report_design_id) return

    navigate({
      to: project_report_design_id,
      params: (prev) => ({
        ...prev,
        projectReportDesignId: project_report_design_id,
      }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={id}
            />
          ))
        }
      </div>
    </div>
  )
}
