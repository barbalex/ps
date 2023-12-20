import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { CheckTaxa as CheckTaxon } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { check_id, check_taxon_id } = useParams()
  const { results } = useLiveQuery(
    db.check_taxa.liveUnique({ where: { check_taxon_id } }),
  )

  const addItem = async () => {
    await db.check_taxa.create({
      data: {
        check_taxon_id: uuidv7(),
        check_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.check_taxa.deleteMany()
  }

  const checkTaxon: CheckTaxon = results

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
      <div>{`Check Taxon with id ${checkTaxon?.check_taxon_id ?? ''}`}</div>
    </div>
  )
}
