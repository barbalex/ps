import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Taxonomies as Taxonomy } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, taxonomy_id } = useParams()
  const { results } = useLiveQuery(
    db.taxonomies.liveUnique({ where: { taxonomy_id } }),
  )

  const addItem = async () => {
    await db.taxonomies.create({
      data: {
        taxonomy_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.taxonomies.deleteMany()
  }

  const taxonomy: Taxonomy = results

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
      <div>{`Taxonomy with id ${taxonomy?.taxonomy_id ?? ''}`}</div>
    </div>
  )
}
