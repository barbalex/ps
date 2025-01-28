import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { action_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const { results: actionReportValues = [] } = useLiveQuery(
    db.action_report_values.liveMany({
      where: { action_report_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const actionReportValue = createActionReportValue()
    await db.action_report_values.create({
      data: {
        ...actionReportValue,
        action_report_id,
      },
    })
    navigate({
      pathname: actionReportValue.action_report_value_id,
      search: searchParams.toString(),
    })
  }, [action_report_id, db.action_report_values, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Action Report Values"
        addRow={add}
        tableName="action report value"
      />
      <div className="list-container">
        {actionReportValues.map(({ action_report_value_id, label }) => (
          <Row
            key={action_report_value_id}
            label={label ?? action_report_value_id}
            navigateTo={action_report_value_id}
          />
        ))}
      </div>
    </div>
  )
})
