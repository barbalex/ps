import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createPlaceReportValue } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { place_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: placeReportValues = [] } = useLiveQuery(
    db.place_report_values.liveMany({
      where: { place_report_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const placeReportValue = createPlaceReportValue()
    await db.place_report_values.create({
      data: {
        ...placeReportValue,
        place_report_id,
      },
    })
    navigate({
      pathname: placeReportValue.place_report_value_id,
      search: searchParams.toString(),
    })
  }, [db.place_report_values, navigate, place_report_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Place Report Values"
        addRow={add}
        tableName="place report value"
      />
      <div className="list-container">
        {placeReportValues.map(({ place_report_value_id, label }) => (
          <Row
            key={place_report_value_id}
            to={place_report_value_id}
            label={label ?? place_report_value_id}
          />
        ))}
      </div>
    </div>
  )
}
