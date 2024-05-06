import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createCheckValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { check_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: checkValues = [] } = useLiveQuery(
    db.check_values.liveMany({
      where: { check_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const checkValue = createCheckValue()
    await db.check_values.create({
      data: {
        ...checkValue,
        check_id,
      },
    })
    navigate({
      pathname: checkValue.check_value_id,
      search: searchParams.toString(),
    })
  }, [check_id, db.check_values, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Check Values"
        addRow={add}
        tableName="check value"
      />
      <div className="list-container">
        {checkValues.map(({ check_value_id, label }) => (
          <Row
            key={check_value_id}
            label={label ?? check_value_id}
            to={check_value_id}
          />
        ))}
      </div>
    </div>
  )
}
