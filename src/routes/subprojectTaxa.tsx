import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams<{
    subproject_id: string
    project_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.subproject_taxa.liveMany())

  const add = async () => {
    await db.subproject_taxa.create({
      data: {
        subproject_taxon_id: uuidv7(),
        subproject_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.subproject_taxa.deleteMany()
  }

  const subproject_taxa: SubprojectTaxon[] = results ?? []

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
      {subproject_taxa.map(
        (subproject_taxon: SubprojectTaxon, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/taxa/${subproject_taxon.subproject_taxon_id}`}
            >
              {subproject_taxon.subproject_taxon_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
