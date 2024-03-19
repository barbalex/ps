import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { PlaceReports as PlaceReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createPlaceReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

interface PlaceReportResult {
  results: PlaceReport[]
}

export const Component = () => {
  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: placeReports = [] }: PlaceReportResult = useLiveQuery(
    db.place_reports.liveMany({
      where: { place_id: place_id2 ?? place_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createPlaceReport({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.place_reports.create({ data })
    navigate({
      pathname: data.place_report_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Reports" addRow={add} tableName="report" />
      <div className="list-container">
        {placeReports.map(({ place_report_id, label }) => (
          <Row key={place_report_id} to={place_report_id} label={label} />
        ))}
      </div>
    </div>
  )
}
