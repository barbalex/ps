import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createActionValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionValues = memo(({ from }) => {
  const { actionId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT action_value_id, label FROM action_values WHERE action_id = $1 ORDER BY label`,
    [actionId],
    'action_value_id',
  )
  const isLoading = res === undefined
  const actionValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createActionValue({ db, actionId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.action_value_id,
      params: (prev) => ({ ...prev, actionValueId: data.action_value_id }),
    })
  }, [actionId, db, navigate])

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
        {isLoading ?
          <Loading />
        : <>
            {actionValues.map(({ action_value_id, label }) => (
              <Row
                key={action_value_id}
                label={label ?? action_value_id}
                to={action_value_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
