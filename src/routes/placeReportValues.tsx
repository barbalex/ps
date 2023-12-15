import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { PlaceReportValues as PlaceReportValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { subproject_id, project_id, place_id, place_report_id } = useParams<{
    subproject_id: string
    project_id: string
    place_id: string
    place_report_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.place_report_values.liveMany())

  const add = async () => {
    await db.place_report_values.create({
      data: {
        place_report_value_id: uuidv7(),
        place_report_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.place_report_values.deleteMany()
  }

  const placeReportValues: PlaceReportValue[] = results ?? []

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
      {placeReportValues.map(
        (placeReportValue: PlaceReportValue, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}/values/${placeReportValue.place_report_value_id}`}
            >
              {placeReportValue.place_report_value_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
