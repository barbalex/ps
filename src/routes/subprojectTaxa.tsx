import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createSubprojectTaxon } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.subproject_taxa.liveMany({
        where: { subproject_id, deleted: false },
        orderBy: { label: 'asc' },
      }),
    [subproject_id],
  )

  const add = useCallback(async () => {
    const subprojectTaxon = createSubprojectTaxon()
    await db.subproject_taxa.create({
      data: {
        ...subprojectTaxon,
        subproject_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/taxa/${subprojectTaxon.subproject_taxon_id}`,
    )
  }, [db.subproject_taxa, navigate, project_id, subproject_id])

  const subproject_taxa: SubprojectTaxon[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Subproject Taxa"
        addRow={add}
        tableName="subproject taxon"
      />
      <div className="list-container">
        {subproject_taxa.map(({ subproject_taxon_id, label }) => (
          <Row
            key={subproject_taxon_id}
            to={`/projects/${project_id}/subprojects/${subproject_id}/taxa/${subproject_taxon_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
