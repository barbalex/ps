import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createGoalReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, goal_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: goals = [] } = useLiveQuery(
    db.goal_reports.liveMany({
      where: { goal_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createGoalReport({ db, project_id, goal_id })
    await db.goal_reports.create({ data })
    navigate({ pathname: data.goal_report_id, search: searchParams.toString() })
  }, [db, goal_id, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Goal Reports"
        addRow={add}
        tableName="goal report"
      />
      <div className="list-container">
        {goals.map(({ goal_report_id, label }) => (
          <Row
            key={goal_report_id}
            label={label ?? goal_report_id}
            to={goal_report_id}
          />
        ))}
      </div>
    </div>
  )
}
