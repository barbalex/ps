import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Taxa as Taxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { taxon as createTaxon } from '../modules/dataPresets'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id, taxonomy_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.taxa.liveMany({ where: { taxonomy_id, deleted: false } }),
    [project_id, taxonomy_id],
  )

  const add = useCallback(async () => {
    const taxon = createTaxon()
    await db.taxa.create({
      data: {
        ...taxon,
        taxonomy_id,
      },
    })
    navigate(
      `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${taxon.taxon_id}`,
    )
  }, [db.taxa, navigate, project_id, taxonomy_id])

  const taxa: Taxon[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="taxon" />
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
