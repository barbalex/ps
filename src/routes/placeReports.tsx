import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { PlaceReports as PlaceReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { placeReport as createNewPlaceReport } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.place_reports.liveMany({
        where: { place_id: place_id2 ?? place_id, deleted: false },
      }),
    [place_id, place_id2],
  )

  const add = useCallback(async () => {
    const data = await createNewPlaceReport({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.place_reports.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports/${data.place_report_id}`,
    )
  }, [db, navigate, place_id, place_id2, project_id, subproject_id])

  const placeReports: PlaceReport[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="place report" />
      {placeReports.map((placeReport: PlaceReport, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/reports/${placeReport.place_report_id}`}
          >
            {placeReport.label ?? placeReport.place_report_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
