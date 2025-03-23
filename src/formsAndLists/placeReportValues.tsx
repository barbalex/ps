import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createPlaceReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const PlaceReportValues = memo(({ from }) => {
  const { placeReportId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  console.log('PlaceReportValues', { placeReportId, from })

  const res = useLiveIncrementalQuery(
    `SELECT place_report_value_id, label FROM place_report_values WHERE place_report_id = $1 ORDER BY label`,
    [placeReportId],
    'place_report_value_id',
  )
  const isLoading = res === undefined
  const placeReportValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createPlaceReportValue({ placeReportId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.place_report_value_id,
      params: (prev) => ({
        ...prev,
        placeReportValueId: data.place_report_value_id,
      }),
    })
  }, [db, navigate, placeReportId])

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
        {isLoading ?
          <Loading />
        : <>
            {placeReportValues.map(({ place_report_value_id, label }) => (
              <Row
                key={place_report_value_id}
                to={place_report_value_id}
                label={label ?? place_report_value_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
