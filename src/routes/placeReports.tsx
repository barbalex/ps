import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
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

export const Component = memo(() => {
  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const [placeReports1Filter] = useAtom(placeReports1FilterAtom)
  const [placeReports2Filter] = useAtom(placeReports2FilterAtom)
  const filter = place_id2 ? placeReports2Filter : placeReports1Filter
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveIncrementalQuery(
    `SELECT place_report_id, label FROM place_reports WHERE place_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    } order by label asc`,
    [place_id2 ?? place_id],
    'place_report_id',
  )
  const isLoading = res === undefined
  const placeReports = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createPlaceReport({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.place_report_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, project_id, searchParams])

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
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {placeReports.map(({ place_report_id, label }) => (
              <Row
                key={place_report_id}
                to={place_report_id}
                label={label ?? place_report_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
