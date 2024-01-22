import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceReports as PlaceReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createPlaceReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.place_reports.liveMany({
        where: { place_id: place_id2 ?? place_id, deleted: false },
        orderBy: { label: 'asc' },
      }),
    [place_id, place_id2],
  )

  const add = useCallback(async () => {
    const data = await createPlaceReport({
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
    <div className="list-view">
      <ListViewHeader
        title="Place Reports"
        addRow={add}
        tableName="place report"
      />
      <div className="list-container">
        {placeReports.map(({ place_report_id, label }) => (
          <Row
            key={place_report_id}
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/reports/${place_report_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
