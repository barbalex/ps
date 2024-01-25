import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Taxonomies as Taxonomy } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createTaxonomy } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.taxonomies.liveMany({
      where: { project_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createTaxonomy({ db, project_id })
    await db.taxonomies.create({ data })
    navigate(`/projects/${project_id}/taxonomies/${data.taxonomy_id}`)
  }, [db, navigate, project_id])

  const taxonomies: Taxonomy[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Taxonomies" addRow={add} tableName="taxonomy" />
      <div className="list-container">
        {taxonomies.map(({ taxonomy_id, label }) => (
          <Row
            key={taxonomy_id}
            label={label}
            to={`/projects/${project_id}/taxonomies/${taxonomy_id}`}
          />
        ))}
      </div>
    </div>
  )
}
