import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createUser } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: occurrences = [] } = useLiveQuery(
    db.occurrences.liveMany({ orderBy: { label: 'asc' } }),
  )

  const add = useCallback(async () => {
    const data = await createUser({ db })

    navigate({ pathname: data.occurrence_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  // console.log('hello occurrences')

  return (
    <div className="list-view">
      <ListViewHeader title="Users" addRow={add} tableName="occurrence" />
      <div className="list-container">
        {occurrences.map(({ occurrence_id, label }) => (
          <Row key={occurrence_id} label={label} to={occurrence_id} />
        ))}
      </div>
    </div>
  )
}
