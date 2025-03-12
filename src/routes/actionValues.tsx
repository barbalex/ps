import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createActionValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT action_value_id, label FROM action_values WHERE action_id = $1 order by label asc`,
    [action_id],
    'action_value_id',
  )
  const isLoading = res === undefined
  const actionValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createActionValue({
      db,
      action_id,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.action_value_id,
      search: searchParams.toString(),
    })
  }, [action_id, db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Action Values"
        nameSingular="action value"
        tableName="action_values"
        isFiltered={false}
        countFiltered={actionValues.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {actionValues.map(({ action_value_id, label }) => (
              <Row
                key={action_value_id}
                label={label ?? action_value_id}
                to={action_value_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
