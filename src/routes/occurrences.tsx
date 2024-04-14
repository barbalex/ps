import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import {
  useNavigate,
  useSearchParams,
  useLocation,
  useParams,
} from 'react-router-dom'

import { createUser } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // TODO: get occurrence_import by subproject_id

  // get pathname from location
  const { pathname } = useLocation()
  const isToAssess = pathname.includes('to-assess')
  const isNotToAssign = pathname.includes('not-to-assign')
  const title = isToAssess
    ? 'Occurrences to assess'
    : 'Occurrences not to assign'

  const { subproject_id } = useParams()
  const where = {}
  // const where = { subproject_id, place_id: null }
  // if (isToAssess) where.not_to_assign = false
  // if (isNotToAssign) where.not_to_assign = true

  const { db } = useElectric()!
  const { results: occurrences = [] } = useLiveQuery(
    db.occurrences.liveMany({
      where,
      orderBy: { label: 'asc' },
      include: { occurrence_imports: true },
    }),
  )

  console.log('hello occurrences', occurrences)

  const add = useCallback(async () => {
    const data = await createUser({ db })

    navigate({ pathname: data.occurrence_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  // console.log('hello occurrences')

  return (
    <div className="list-view">
      <ListViewHeader title={title} addRow={add} tableName="occurrence" />
      <div className="list-container">
        {occurrences.map(({ occurrence_id, label }) => (
          <Row key={occurrence_id} label={label} to={occurrence_id} />
        ))}
      </div>
    </div>
  )
}
