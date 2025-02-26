import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createSubprojectReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { subprojectReportsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(subprojectReportsFilterAtom)
  const isFiltered = !!filter

  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM subproject_reports WHERE subproject_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    } order by label asc`,
    [subproject_id],
  )
  const subprojectReports = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createSubprojectReport({
      db,
      project_id,
      subproject_id,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: subprojectReport.subproject_report_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Subproject Reports"
        nameSingular="subproject report"
        tableName="subproject_reports"
        ifFiltered={isFiltered}
        countFiltered={subprojectReports.length}
        addRow={add}
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
