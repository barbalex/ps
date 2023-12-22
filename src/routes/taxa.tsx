import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Taxa as Taxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { taxon as createTaxonPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id, taxonomy_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.taxa.liveMany({ where: { taxonomy_id, deleted: false } }),
    [project_id, taxonomy_id],
  )

  const add = async () => {
    const newTaxon = createTaxonPreset()
    await db.taxa.create({
      data: {
        ...newTaxon,
        taxonomy_id,
      },
    })
    navigate(
      `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${newTaxon.taxon_id}`,
    )
  }

  const clear = async () => {
    await db.taxa.deleteMany()
  }

  const taxa: Taxon[] = results ?? []

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
      {taxa.map((taxon: Taxon, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${taxon.taxon_id}`}
          >
            {taxon.label ?? taxon.taxon_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
