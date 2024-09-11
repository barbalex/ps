import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createGoal } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_goals?.filter((f) => Object.keys(f).length > 0) ?? [],
    [appState],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: goals = [] } = useLiveQuery(
    db.goals.liveMany({
      where: { subproject_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: goalsUnfiltered = [] } = useLiveQuery(
    db.goals.liveMany({
      where: { subproject_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = goals.length !== goalsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createGoal({ db, project_id, subproject_id })
    await db.goals.create({ data })
    navigate({ pathname: data.goal_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Goals (${
          isFiltered
            ? `${goals.length}/${goalsUnfiltered.length}`
            : goals.length
        })`}
        addRow={add}
        tableName="goal"
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {goals.map(({ goal_id, label }) => (
          <Row
            key={goal_id}
            label={label ?? goal_id}
            to={goal_id}
          />
        ))}
      </div>
    </div>
  )
})
