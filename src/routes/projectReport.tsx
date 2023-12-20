import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { ProjectReports as ProjectReport } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, project_report_id } = useParams()
  const { results } = useLiveQuery(
    db.project_reports.liveUnique({ where: { project_report_id } }),
  )

  const addItem = async () => {
    await db.project_reports.create({
      data: {
        project_report_id: uuidv7(),
        project_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.project_reports.deleteMany()
  }

  const projectReport: ProjectReport = results

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Project Report with id ${
        projectReport?.project_report_id ?? ''
      }`}</div>
    </div>
  )
}
