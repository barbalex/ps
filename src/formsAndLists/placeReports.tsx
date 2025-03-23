import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createPlaceReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { placeReports1FilterAtom, placeReports2FilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

export const PlaceReports = memo(({ from }) => {
  const { projectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const [placeReports1Filter] = useAtom(placeReports1FilterAtom)
  const [placeReports2Filter] = useAtom(placeReports2FilterAtom)
  const filter = placeId2 ? placeReports2Filter : placeReports1Filter
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveIncrementalQuery(
    `
    SELECT 
      place_report_id, 
      label 
    FROM place_reports 
    WHERE place_id = $1${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY label`,
    [placeId2 ?? placeId],
    'place_report_id',
  )
  const isLoading = res === undefined
  const placeReports = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createPlaceReport({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.place_report_id,
      params: (prev) => ({ ...prev, placeReportId: data.place_report_id }),
    })
  }, [db, navigate, placeId, placeId2, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Place Reports"
        nameSingular="place report"
        tableName="place_reports"
        isFiltered={isFiltered}
        countFiltered={placeReports.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {placeReports.map(({ place_report_id, label }) => (
              <Row
                key={place_report_id}
                to={place_report_id}
                label={label ?? place_report_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
