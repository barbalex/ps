import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { CheckTaxa as CheckTaxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { subproject_id, project_id, place_id, check_id } = useParams<{
    subproject_id: string
    project_id: string
    place_id: string
    check_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.check_taxa.liveMany())

  const add = async () => {
    await db.check_taxa.create({
      data: {
        check_taxon_id: uuidv7(),
        check_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.check_taxa.deleteMany()
  }

  const checkTaxa: CheckTaxon[] = results ?? []

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
      {checkTaxa.map((checkTaxon: CheckTaxon, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/taxa/${checkTaxon.check_taxon_id}`}
          >
            {checkTaxon.check_taxon_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
