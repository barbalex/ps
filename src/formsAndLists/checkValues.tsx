import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createCheckValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const CheckValues = memo(({ from }) => {
  const { checkId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT check_value_id, label FROM check_values WHERE check_id = $1 ORDER BY label`,
    [checkId],
    'check_value_id',
  )
  const isLoading = res === undefined
  const checkValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createCheckValue({ checkId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.check_value_id,
      params: (prev) => ({ ...prev, checkValueId: data.check_value_id }),
    })
  }, [checkId, db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Check Values"
        nameSingular="check value"
        tablename="check_values"
        isFiltered={false}
        countFiltered={checkValues.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {checkValues.map(({ check_value_id, label }) => (
              <Row
                key={check_value_id}
                label={label ?? check_value_id}
                to={check_value_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
