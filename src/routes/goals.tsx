import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createGoal } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { goalsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(goalsFilterAtom)
  const isFiltered = !!filter

  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM goals WHERE subproject_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    }`,
    [subproject_id],
  )
  const goals = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createGoal({ db, project_id, subproject_id })
    const data = res?.rows?.[0]
    navigate({ pathname: data.goal_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Goals"
        nameSingular="Goal"
        tableName="goals"
        isFiltered={isFiltered}
        countFiltered={goals.length}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {goals.map(({ goal_id, label }) => (
          <Row key={goal_id} label={label ?? goal_id} to={goal_id} />
        ))}
      </div>
    </div>
  )
})
