import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createCheckTaxon } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { check_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: checkTaxa = [] } = useLiveQuery(
    db.check_taxa.liveMany({
      where: { check_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const checkTaxon = createCheckTaxon()
    await db.check_taxa.create({
      data: {
        ...checkTaxon,
        check_id,
      },
    })
    navigate({
      pathname: checkTaxon.check_taxon_id,
      search: searchParams.toString(),
    })
  }, [check_id, db.check_taxa, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Check Taxa" addRow={add} tableName="check taxon" />
      <div className="list-container">
        {checkTaxa.map(({ check_taxon_id, label }) => (
          <Row
            key={check_taxon_id}
            label={label ?? check_taxon_id}
            to={check_taxon_id}
          />
        ))}
      </div>
    </div>
  )
}
