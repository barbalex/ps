import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Taxa as Taxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { project_id, taxonomy_id } = useParams<{ project_id: string }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.taxa.liveMany())

  const add = async () => {
    await db.taxa.create({
      data: {
        taxon_id: uuidv7(),
        taxonomy_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.taxa.deleteMany()
  }

  const taxa: Taxon[] = results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {taxa.map((taxon: Taxon, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${taxon.taxon_id}}`}
          >
            {taxon.taxon_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
