import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Fields as Field } from '../../generated/client'

export const PropertyField = ({ table }) => {
  const { project_id } = useParams()

  const { db } = useElectric()!
  // get fields of table
  const { results = [] } = useLiveQuery(
    db.fields.findMany({
      where: { table_name: table, project_id, deleted: false },
    }),
  )
  const fields: Field[] = results

  return (
    <div>
      <h1>PropertyField</h1>
    </div>
  )
}
