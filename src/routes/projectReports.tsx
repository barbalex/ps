import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { ProjectReports as ProjectReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { projectReport as createProjectReportPreset } from '../modules/dataPresets'
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
    const newProjectReport = createProjectReportPreset()
    await db.project_reports.create({
      data: {
        ...newProjectReport,
        project_id,
      },
    })
    navigate(
      `/projects/${project_id}/reports/${newProjectReport.project_report_id}`,
    )
  }, [db.project_reports, navigate, project_id])

  const projectReports: ProjectReport[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
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
