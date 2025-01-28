import { useCallback, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { subprojectReportsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(subprojectReportsFilterAtom)
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

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
        menus={<FilterButton isFiltered={isFiltered} />}
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
