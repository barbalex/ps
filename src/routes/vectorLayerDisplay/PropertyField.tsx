import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'

export const PropertyField = ({ table }) => {
  const { db } = useElectric()!
  // get fields of table
  const { results } = useLiveQuery(db.vector_layer_displays.findMany())

  return (
    <div>
      <h1>PropertyField</h1>
    </div>
  )
}
