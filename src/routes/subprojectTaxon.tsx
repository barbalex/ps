import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { subproject_id, subproject_taxon_id } = useParams()
  const { results } = useLiveQuery(
    db.subproject_taxa.liveUnique({ where: { subproject_taxon_id } }),
  )

  const addItem = async () => {
    await db.subproject_taxa.create({
      data: {
        subproject_taxon_id: uuidv7(),
        subproject_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.subproject_taxa.deleteMany()
  }

  const subproject_taxon: Place = results

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Taxon with id ${
        subproject_taxon?.subproject_taxon_id ?? ''
      }`}</div>
    </div>
  )
}
