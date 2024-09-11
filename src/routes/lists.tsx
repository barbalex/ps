import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createList } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_lists?.filter((f) => Object.keys(f).length > 0) ?? [],
    [appState],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: lists = [] } = useLiveQuery(
    db.lists.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: listsUnfiltered = [] } = useLiveQuery(
    db.lists.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = lists.length !== listsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createList({ db, project_id })
    await db.lists.create({ data })
    navigate({ pathname: data.list_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Lists (${
          isFiltered
            ? `${lists.length}/${listsUnfiltered.length}`
            : lists.length
        })`}
        addRow={add}
        tableName="list"
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {lists.map(({ list_id, label }) => (
          <Row
            key={list_id}
            to={list_id}
            label={label ?? list_id}
          />
        ))}
      </div>
    </div>
  )
})
