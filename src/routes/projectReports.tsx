import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createProjectReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_project_reports?.filter(
        (f) => Object.keys(f).length > 0,
      ) ?? [],
    [appState?.filter_project_reports],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]

  const { results: projectReports = [] } = useLiveQuery(
    db.project_reports.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: projectReportsUnfiltered = [] } = useLiveQuery(
    db.project_reports.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = projectReports.length !== projectReportsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createProjectReport({ db, project_id })
    await db.project_reports.create({ data })
    navigate({
      pathname: data.project_report_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Project Reports (${
          isFiltered
            ? `${projectReports.length}/${projectReportsUnfiltered.length}`
            : projectReports.length
        })`}
        addRow={add}
        tableName="project report"
        menus={
          <FilterButton
            table="project_reports"
            filterField="filter_project_reports"
          />
        }
      />
      <div className="list-container">
        {projectReports.map(({ project_report_id, label }) => (
          <Row
            key={project_report_id}
            to={project_report_id}
            label={label ?? project_report_id}
          />
        ))}
      </div>
    </div>
  )
})
