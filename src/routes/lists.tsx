import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createList } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { listsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(listsFilterAtom)
  const isFiltered = !!filter

  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM lists WHERE project_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    } order by label asc`,
    [project_id],
  )
  const lists = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createList({ db, project_id })
    const data = res?.rows?.[0]
    navigate({ pathname: data.list_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Lists"
        nameSingular="list"
        tableName="lists"
        isFiltered={isFiltered}
        countFiltered={lists.length}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {lists.map(({ list_id, label }) => (
          <Row key={list_id} to={list_id} label={label ?? list_id} />
        ))}
      </div>
    </div>
  )
})
