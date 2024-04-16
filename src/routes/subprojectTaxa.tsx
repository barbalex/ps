import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createSubprojectTaxon } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: subprojectTaxa = [] } = useLiveQuery(
    db.subproject_taxa.liveMany({
      where: { subproject_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const subprojectTaxon = createSubprojectTaxon()
    await db.subproject_taxa.create({
      data: {
        ...subprojectTaxon,
        subproject_id,
      },
    })
    navigate({
      pathname: subprojectTaxon.subproject_taxon_id,
      search: searchParams.toString(),
    })
  }, [db.subproject_taxa, navigate, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Subproject Taxa"
        addRow={add}
        tableName="subproject taxon"
      />
      <div className="list-container">
        {subprojectTaxa.map(({ subproject_taxon_id, label }) => (
          <Row
            key={subproject_taxon_id}
            to={subproject_taxon_id}
            label={label ?? subproject_taxon_id}
          />
        ))}
      </div>
    </div>
  )
}
