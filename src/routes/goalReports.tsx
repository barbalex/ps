import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createGoalReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id, goal_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM goal_reports WHERE goal_id = $1 ORDER BY label ASC`,
    [goal_id],
  )
  const goals = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createGoalReport({ db, project_id, goal_id })
    const data = res.rows[0]
    navigate({ pathname: data.goal_report_id, search: searchParams.toString() })
  }, [db, goal_id, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Goal Reports"
        nameSingular="Goal Report"
        tableName="goal_reports"
        isFiltered={false}
        countFiltered={goals.length}
        addRow={add}
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
})
