import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createPlaceReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { place_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM place_report_values WHERE place_report_id = $1 ORDER BY label ASC`,
    [place_report_id],
  )
  const placeReportValues = result.rows ?? []

  const add = useCallback(async () => {
    const res = await createPlaceReportValue({ place_report_id, db })
    const placeReportValue = res.rows[0]
    navigate({
      pathname: placeReportValue.place_report_value_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_report_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Place Report Values"
        nameSingular="place report value"
        tableName="place_report_values"
        isFiltered={false}
        countFiltered={placeReportValues.length}
        addRow={add}
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
})
