import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Taxa as Taxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createTaxon } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, taxonomy_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.taxa.liveMany({
      where: { taxonomy_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
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
    <div className="list-view">
      <ListViewHeader title="Taxa" addRow={add} tableName="taxon" />
      <div className="list-container">
        {taxa.map(({ taxon_id, label }) => (
          <Row
            key={taxon_id}
            label={label}
            to={`/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${taxon_id}`}
          />
        ))}
      </div>
    </div>
  )
}
