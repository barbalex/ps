import { useCallback, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoalReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { goal_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const { results: goalReportValues = [] } = useLiveQuery(
    db.goal_report_values.liveMany({
      where: { goal_report_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const newGoalReportValue = createGoalReportValue()
    await db.goal_report_values.create({
      data: {
        ...newGoalReportValue,
        goal_report_id,
      },
    })
    navigate({
      pathname: newGoalReportValue.goal_report_value_id,
      search: searchParams.toString(),
    })
  }, [db.goal_report_values, goal_report_id, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Goal Report Values"
        addRow={add}
        tableName="goal report value"
      />
      <div className="list-container">
        {goalReportValues.map(({ goal_report_value_id, label }) => (
          <Row
            key={goal_report_value_id}
            label={label ?? goal_report_value_id}
            to={goal_report_value_id}
          />
        ))}
      </div>
    </div>
  )
})
