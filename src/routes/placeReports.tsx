import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { PlaceReports as PlaceReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { placeReport as createPlaceReportPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_reports.liveMany({ where: { place_id, deleted: false } }),
    [place_id],
  )

  const add = useCallback(async () => {
    const newPlaceReport = createPlaceReportPreset()
    await db.place_reports.create({
      data: {
        ...newPlaceReport,
        place_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${newPlaceReport.place_report_id}`,
    )
  }, [db.place_reports, navigate, place_id, project_id, subproject_id])

  const placeReports: PlaceReport[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {placeReports.map((placeReport: PlaceReport, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/reports/${placeReport.place_report_id}`}
          >
            {placeReport.label ?? placeReport.place_report_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
