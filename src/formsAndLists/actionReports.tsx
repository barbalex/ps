import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createActionReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionReports = memo(({ from }) => {
  const { projectId, actionId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT action_report_id, label FROM action_reports WHERE action_id = $1 ORDER BY label`,
    [actionId],
    'action_report_id',
  )
  const isLoading = res === undefined
  const actionReports = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createActionReport({ db, projectId, actionId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.action_report_id,
      params: (prev) => ({ ...prev, actionReportId: data.action_report_id }),
    })
  }, [actionId, db, navigate, projectId])

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
        {isLoading ?
          <Loading />
        : <>
            {actionReports.map(({ action_report_id, label }) => (
              <Row
                key={action_report_id}
                label={label ?? account_report_id}
                to={action_report_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
