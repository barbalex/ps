import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createGoal } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { goalsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(goalsFilterAtom)
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT 
      goal_id, 
      label 
    FROM goals 
    WHERE 
      subproject_id = $1
      ${isFiltered ? ` AND(${filterString})` : ''}
    ORDER BY label`,
    [subproject_id],
    'goal_id',
  )
  const isLoading = res === undefined
  const goals = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createGoal({ db, project_id, subproject_id })
    const data = res?.rows?.[0]
    if (!data) return
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
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {goals.map(({ goal_id, label }) => (
              <Row
                key={goal_id}
                label={label ?? goal_id}
                to={goal_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
