import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createGoal } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: goals = [] } = useLiveQuery(
    db.goals.liveMany({
      where: { subproject_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createGoal({ db, project_id, subproject_id })
    await db.goals.create({ data })
    navigate({ pathname: data.goal_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader title="Goals" addRow={add} tableName="goal" />
      <div className="list-container">
        {goals.map(({ goal_id, label }) => (
          <Row key={goal_id} label={label ?? goal_id} to={goal_id} />
        ))}
      </div>
    </div>
  )
}
