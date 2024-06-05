import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createSubprojectReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = memo(() => {
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_subproject_reports?.filter(
        (f) => Object.keys(f).length > 0,
      ) ?? [],
    [appState?.filter_subproject_reports],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: subprojectReports = [] } = useLiveQuery(
    db.subproject_reports.liveMany({
      where: { subproject_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: subprojectReportsUnfiltered = [] } = useLiveQuery(
    db.subproject_reports.liveMany({
      where: { subproject_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered =
    subprojectReports.length !== subprojectReportsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createSubprojectReport({
      db,
      project_id,
      subproject_id,
    })
    await db.subproject_reports.create({ data })
    navigate({
      pathname: data.subproject_report_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Subproject Reports (${
          isFiltered
            ? `${subprojectReports.length}/${subprojectReportsUnfiltered.length}`
            : subprojectReports.length
        })`}
        addRow={add}
        tableName="subproject report"
        menus={
          <FilterButton
            table="subproject_reports"
            filterField="filter_subproject_reports"
          />
        }
      />
      <div className="list-container">
        {subprojectReports.map(({ subproject_report_id, label }) => (
          <Row
            key={subproject_report_id}
            to={subproject_report_id}
            label={label ?? subproject_report_id}
          />
        ))}
      </div>
    </div>
  )
})
