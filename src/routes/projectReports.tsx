import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { ProjectReports as ProjectReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams<{ project_id: string }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.project_reports.liveMany())

  const add = async () => {
    await db.project_reports.create({
      data: {
        project_report_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.project_reports.deleteMany()
  }

  const projectReports: ProjectReport[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {projectReports.map((projectReport: ProjectReport, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/reports/${projectReport.project_report_id}`}
          >
            {projectReport.project_report_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
