import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
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

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/reports/'

export const SubprojectReports = memo(() => {
  const [filter] = useAtom(subprojectReportsFilterAtom)
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()
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
    [subprojectId],
    'subproject_report_id',
  )
  const isLoading = res === undefined
  const subprojectReports = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createSubprojectReport({
      db,
      project_id: projectId,
      subproject_id: subprojectId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.subproject_report_id,
      params: (prev) => ({
        ...prev,
        subprojectReportId: data.subproject_report_id,
      }),
    })
  }, [db, navigate, projectId, subprojectId])

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
        {isLoading ?
          <Loading />
        : <>
            {subprojectReports.map(({ subproject_report_id, label }) => (
              <Row
                key={subproject_report_id}
                to={subproject_report_id}
                label={label ?? subproject_report_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
