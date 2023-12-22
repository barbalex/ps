import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Taxonomies as Taxonomy } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { taxonomy as createTaxonomyPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.taxonomies.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = async () => {
    const newTaxonomy = createTaxonomyPreset()
    await db.taxonomies.create({
      data: {
        ...newTaxonomy,
        project_id,
      },
    })
    navigate(`/projects/${project_id}/taxonomies/${newTaxonomy.taxonomy_id}`)
  }

  const clear = async () => {
    await db.taxonomies.deleteMany()
  }

  const taxonomies: Taxonomy[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
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
