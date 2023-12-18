import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { PlaceReports as PlaceReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id, place_id } = useParams<{
    subproject_id: string
    project_id: string
    place_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.place_reports.liveMany())

  const add = async () => {
    await db.place_reports.create({
      data: {
        place_report_id: uuidv7(),
        place_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.place_reports.deleteMany()
  }

  const placeReports: PlaceReport[] = results ?? []

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
      {placeReports.map((placeReport: PlaceReport, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${placeReport.place_report_id}`}
          >
            {placeReport.place_report_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
