import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { subprojectTaxon as createSubprojectTaxonPreset } from '../modules/dataPresets'
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
    const newSubprojectTaxon = createSubprojectTaxonPreset()
    await db.subproject_taxa.create({
      data: {
        ...newSubprojectTaxon,
        subproject_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/taxa/${newSubprojectTaxon.subproject_taxon_id}`,
    )
  }, [db.subproject_taxa, navigate, project_id, subproject_id])

  const subproject_taxa: SubprojectTaxon[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
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
