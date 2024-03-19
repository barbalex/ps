import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createTaxon } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { taxonomy_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: taxa = [] } = useLiveQuery(
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
    navigate({ pathname: taxon.taxon_id, search: searchParams.toString() })
  }, [db.taxa, navigate, searchParams, taxonomy_id])

  return (
    <div className="list-view">
      <ListViewHeader title="Taxa" addRow={add} tableName="taxon" />
      <div className="list-container">
        {taxa.map(({ taxon_id, label }) => (
          <Row key={taxon_id} label={label} to={taxon_id} />
        ))}
      </div>
    </div>
  )
}
