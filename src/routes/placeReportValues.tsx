import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createPlaceReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { place_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT place_report_value_id, label FROM place_report_values WHERE place_report_id = $1 ORDER BY label`,
    [place_report_id],
    'place_report_value_id',
  )
  const isLoading = res === undefined
  const placeReportValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createPlaceReportValue({ place_report_id, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.place_report_value_id,
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
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {placeReportValues.map(({ place_report_value_id, label }) => (
              <Row
                key={place_report_value_id}
                to={place_report_value_id}
                label={label ?? place_report_value_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
