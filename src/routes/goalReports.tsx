import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createGoalReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id, goal_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT goal_report_id, label FROM goal_reports WHERE goal_id = $1 ORDER BY label ASC`,
    [goal_id],
    'goal_report_id',
  )
  const isLoading = res === undefined
  const goals = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createGoalReport({ db, project_id, goal_id })
    console.log('goalReport.add, res:', res)
    const data = res?.rows?.[0]
    if (!data) return
    console.log('goalReport.add, data:', data)
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
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {goals.map(({ goal_report_id, label }) => (
              <Row
                key={goal_report_id}
                label={label ?? goal_report_id}
                to={goal_report_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
