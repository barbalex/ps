import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { PlaceReportValues as PlaceReportValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { placeReportValue as createPlaceReportValuePreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.place_report_values.liveMany({
        where: { place_report_id, deleted: false },
      }),
    [place_report_id],
  )

  const add = useCallback(async () => {
    const newPlaceReportValue = createPlaceReportValuePreset()
    await db.place_report_values.create({
      data: {
        ...newPlaceReportValue,
        place_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}/values/${newPlaceReportValue.place_report_value_id}`,
    )
  }, [
    db.place_report_values,
    navigate,
    place_id,
    place_report_id,
    project_id,
    subproject_id,
  ])

  const placeReportValues: PlaceReportValue[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {placeReportValues.map(
        (placeReportValue: PlaceReportValue, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${place_report_id}/values/${placeReportValue.place_report_value_id}`}
            >
              {placeReportValue.label ?? placeReportValue.place_report_value_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
