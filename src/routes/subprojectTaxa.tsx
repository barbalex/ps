import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { subprojectTaxon as createSubprojectTaxon } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.subproject_taxa.liveMany({ where: { subproject_id, deleted: false } }),
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
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="subproject taxon" />
      {subproject_taxa.map(
        (subproject_taxon: SubprojectTaxon, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/taxa/${subproject_taxon.subproject_taxon_id}`}
            >
              {subproject_taxon.label ?? subproject_taxon.subproject_taxon_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
