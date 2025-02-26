import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createActionReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { action_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `Select * from action_report_values where action_report_id = $1 order by label ASC;`,
    [action_report_id],
  )
  const actionReportValues = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createActionReportValue({
      db,
      action_report_id,
    })
    const data = res?.rows?.[0]
    navigate({
      pathname: data.action_report_value_id,
      search: searchParams.toString(),
    })
  }, [action_report_id, db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Action Report Values"
        nameSingular="action report value"
        tableName="action_report_values"
        isFiltered={false}
        countFiltered={actionReportValues.length}
        addRow={add}
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
