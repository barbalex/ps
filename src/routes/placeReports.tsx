import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { placeReports1FilterAtom, placeReports2FilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [placeReports1Filter] = useAtom(placeReports1FilterAtom)
  const [placeReports2Filter] = useAtom(placeReports2FilterAtom)

  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const filter = place_id2 ? placeReports2Filter : placeReports1Filter
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: placeReports = [] } = useLiveQuery(
    db.place_reports.liveMany({
      where: { place_id: place_id2 ?? place_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: placeReportsUnfiltered = [] } = useLiveQuery(
    db.place_reports.liveMany({
      where: { place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = placeReports.length !== placeReportsUnfiltered.length

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
      <ListViewHeader
        title={`Place Reports (${
          isFiltered
            ? `${placeReports.length}/${placeReportsUnfiltered.length}`
            : placeReports.length
        })`}
        addRow={add}
        tableName="report"
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {placeReports.map(({ place_report_id, label }) => (
          <Row
            key={place_report_id}
            to={place_report_id}
            label={label ?? place_report_id}
          />
        ))}
      </div>
    </div>
  )
})
