import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Taxa as Taxon } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { taxonomy_id, taxon_id } = useParams()
  const { results } = useLiveQuery(db.taxa.liveUnique({ where: { taxon_id } }))

  const addItem = async () => {
    await db.taxa.create({
      data: {
        taxon_id: uuidv7(),
        taxonomy_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.taxa.deleteMany()
  }

  const taxon: Taxon = results

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
      <div>{`Taxon with id ${taxon?.taxon_id ?? ''}`}</div>
    </div>
  )
}
