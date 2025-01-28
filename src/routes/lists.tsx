import { useCallback, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createList } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { listsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(listsFilterAtom)
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

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
