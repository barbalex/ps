import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createActionReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id, action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT action_report_id, label FROM action_reports WHERE action_id = $1 order by label asc`,
    [action_id],
    'action_report_id',
  )
  const isLoading = res === undefined
  const actionReports = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createActionReport({
      db,
      project_id,
      action_id,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.action_report_id,
      search: searchParams.toString(),
    })
  }, [action_id, db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Action Reports"
        nameSingular="action report"
        tableName="action_reports"
        isFiltered={false}
        countFiltered={actionReports.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {actionReports.map(({ action_report_id, label }) => (
              <Row
                key={action_report_id}
                label={label ?? account_report_id}
                to={action_report_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
