import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Taxonomies as Taxonomy } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { taxonomy as createTaxonomy } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.taxonomies.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const data = await createTaxonomy({ db, project_id })
    await db.taxonomies.create({ data })
    navigate(`/projects/${project_id}/taxonomies/${data.taxonomy_id}`)
  }, [db, navigate, project_id])

  const taxonomies: Taxonomy[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="taxonomy" />
      {taxonomies.map((taxonomy: Taxonomy, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/taxonomies/${taxonomy.taxonomy_id}`}
          >
            {taxonomy.label ?? taxonomy.taxonomy_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
