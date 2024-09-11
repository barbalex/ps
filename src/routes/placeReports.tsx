import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createPlaceReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const filterField = place_id2
    ? 'filter_place_reports_2'
    : 'filter_place_reports_1'

  const filter = useMemo(
    () =>
      appState?.[filterField]?.filter?.((f) => Object.keys(f).length > 0) ?? [],
    [appState, filterField],
  )
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
