import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createGoalReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { goal_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT goal_report_value_id, label FROM goal_report_values WHERE goal_report_id = $1 ORDER BY label ASC`,
    [goal_report_id],
    'goal_report_value_id',
  )
  const isLoading = res === undefined
  const goalReportValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createGoalReportValue({ db, goal_report_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.goal_report_value_id,
      search: searchParams.toString(),
    })
  }, [db, goal_report_id, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Goal Report Values"
        nameSingular="Goal Report Value"
        tableName="goal_report_values"
        isFiltered={false}
        countFiltered={goalReportValues.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {goalReportValues.map(({ goal_report_value_id, label }) => (
              <Row
                key={goal_report_value_id}
                label={label ?? goal_report_value_id}
                to={goal_report_value_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
