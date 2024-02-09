import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { Places1Layer } from './Places1Layer'

const layerToComponent = {
  places1: Places1Layer,
}

export const TableLayers = () => {
  const { db } = useElectric()!

  const { results: vectorLayerDisplayResults = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { data_table: { not: null }, active: true },
    }),
  )

  console.log(
    'hello TableLayers, vectorLayerDisplayResults:',
    vectorLayerDisplayResults,
  )

  return vectorLayerDisplayResults.map((display) => {
    const Component = layerToComponent[display.data_table]
    return <Component key={display.vector_layer_display_id} display={display} />
  })
}
