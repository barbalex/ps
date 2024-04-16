import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createTaxonomy } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: taxonomies = [] } = useLiveQuery(
    db.taxonomies.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createTaxonomy({ db, project_id })
    await db.taxonomies.create({ data })
    navigate({ pathname: data.taxonomy_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Taxonomies" addRow={add} tableName="taxonomy" />
      <div className="list-container">
        {taxonomies.map(({ taxonomy_id, label }) => (
          <Row
            key={taxonomy_id}
            label={label ?? taxonomy_id}
            to={taxonomy_id}
          />
        ))}
      </div>
    </div>
  )
}
