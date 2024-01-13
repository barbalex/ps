import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ProjectReports as ProjectReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createProjectReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.project_reports.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const data = await createProjectReport({ db, project_id })
    await db.project_reports.create({ data })
    navigate(`/projects/${project_id}/reports/${data.project_report_id}`)
  }, [db, navigate, project_id])

  const projectReports: ProjectReport[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Project Reports"
        addRow={add}
        tableName="project report"
      />
      <div className="list-container">
        {projectReports.map(({ project_report_id, label }) => (
          <Row
            key={project_report_id}
            to={`/projects/${project_id}/reports/${project_report_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
