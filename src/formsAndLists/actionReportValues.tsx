import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createActionReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionReportValues = memo(({ from }) => {
  const { actionReportId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `Select action_report_value_id, label from action_report_values where action_report_id = $1 ORDER BY label;`,
    [actionReportId],
    'action_report_value_id',
  )
  const isLoading = res === undefined
  const actionReportValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createActionReportValue({ db, actionReportId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.action_report_value_id,
      params: (prev) => ({
        ...prev,
        actionReportValueId: data.action_report_value_id,
      }),
    })
  }, [actionReportId, db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Action Report Values"
        nameSingular="action report value"
        tableName="action_report_values"
        isFiltered={false}
        countFiltered={actionReportValues.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {actionReportValues.map(({ action_report_value_id, label }) => (
              <Row
                key={action_report_value_id}
                label={label ?? action_report_value_id}
                navigateTo={action_report_value_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
