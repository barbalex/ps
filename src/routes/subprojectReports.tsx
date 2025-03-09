import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createSubprojectReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { subprojectReportsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(subprojectReportsFilterAtom)
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT 
      subproject_report_id, 
      label 
    FROM subproject_reports 
    WHERE 
      subproject_id = $1
      ${isFiltered ? ` AND(${filterString})` : ''} 
    ORDER BY label`,
    [subproject_id],
    'subproject_report_id',
  )
  const isLoading = res === undefined
  const subprojectReports = res?.rows ?? []

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
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {subprojectReports.map(({ subproject_report_id, label }) => (
              <Row
                key={subproject_report_id}
                to={subproject_report_id}
                label={label ?? subproject_report_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
