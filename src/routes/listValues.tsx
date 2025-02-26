import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createListValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { list_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM list_values WHERE list_id = $1 order by label asc`,
    [list_id],
  )
  const listValues = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createListValue({ db, list_id })
    const list_value_id = res?.rows?.[0]?.list_value_id
    navigate({
      pathname: list_value_id,
      search: searchParams.toString(),
    })
  }, [db, list_id, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="List Values"
        nameSingular="list value"
        tableName="list_values"
        isFiltered={false}
        countFiltered={listValues.length}
        addRow={add}
      />
      <div className="list-container">
        {listValues.map(({ list_value_id, label }) => (
          <Row
            key={list_value_id}
            to={list_value_id}
            label={label ?? list_value_id}
          />
        ))}
      </div>
    </div>
  )
})
