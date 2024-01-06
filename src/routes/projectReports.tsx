import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ProjectReports as ProjectReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { projectReport as createNewProjectReport } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
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
    const data = await createNewProjectReport({ db, project_id })
    await db.project_reports.create({ data })
    navigate(`/projects/${project_id}/reports/${data.project_report_id}`)
  }, [db, navigate, project_id])

  const projectReports: ProjectReport[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="project report" />
      {projectReports.map((projectReport: ProjectReport, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/reports/${projectReport.project_report_id}`}
          >
            {projectReport.label ?? projectReport.project_report_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
