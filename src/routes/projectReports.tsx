import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createProjectReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { projectReportsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(projectReportsFilterAtom)
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `SELECT project_report_id, label FROM project_reports WHERE project_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    } order by label asc`,
    [project_id],
    'project_report_id',
  )
  const isLoading = res === undefined
  const projectReports = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createProjectReport({ db, project_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.project_report_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Project Reports"
        nameSingular="project report"
        tableName="project_reports"
        isFiltered={isFiltered}
        countFiltered={projectReports.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {projectReports.map(({ project_report_id, label }) => (
              <Row
                key={project_report_id}
                to={project_report_id}
                label={label ?? project_report_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
