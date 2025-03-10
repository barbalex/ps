import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createCheckValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { check_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT check_value_id, label FROM check_values WHERE check_id = $1 ORDER BY label ASC`,
    [check_id],
    'check_value_id',
  )
  const isLoading = res === undefined
  const checkValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createCheckValue({ check_id, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.check_value_id,
      search: searchParams.toString(),
    })
  }, [check_id, db, navigate, searchParams])

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
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {checkValues.map(({ check_value_id, label }) => (
              <Row
                key={check_value_id}
                label={label ?? check_value_id}
                to={check_value_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
