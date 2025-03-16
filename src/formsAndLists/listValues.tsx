import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createListValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/lists/$listId_/values/'

export const ListValues = memo(() => {
  const { listId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT list_value_id, label FROM list_values WHERE list_id = $1 ORDER BY label`,
    [listId],
    'list_value_id',
  )
  const isLoading = res === undefined
  const listValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createListValue({ db, list_id: listId })
    const list_value_id = res?.rows?.[0]?.list_value_id
    if (!list_value_id) return
    navigate({
      to: list_value_id,
      params: (prev) => ({ ...prev, listValueId: list_value_id }),
    })
  }, [db, listId, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="List Values"
        nameSingular="list value"
        tableName="list_values"
        isFiltered={false}
        countFiltered={listValues.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {listValues.map(({ list_value_id, label }) => (
              <Row
                key={list_value_id}
                to={list_value_id}
                label={label ?? list_value_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
