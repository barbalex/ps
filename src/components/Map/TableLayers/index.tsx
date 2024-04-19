import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { vectorLayerTypes } from '../../../modules/updateTableVectorLayerLabels'
import { Places1 } from './Places1'
import { Places2 } from './Places2'
import { Checks1 } from './Checks1'
import { Checks2 } from './Checks2'
import { Actions1 } from './Actions1'
import { Actions2 } from './Actions2'
import { OccurrencesAssigned1 } from './OccurrencesAssigned1'
import { OccurrencesAssigned2 } from './OccurrencesAssigned2'
import { OccurrencesToAssess } from './OccurrencesToAssess'
import { OccurrencesNotToAssign } from './OccurrencesNotToAssign'

const layerToComponent = {
  places1: Places1,
  places2: Places2,
  checks1: Checks1,
  checks2: Checks2,
  actions1: Actions1,
  actions2: Actions2,
  occurrences_assigned1: OccurrencesAssigned1,
  occurrences_assigned2: OccurrencesAssigned2,
  occurrences_to_assess: OccurrencesToAssess,
  occurrences_not_to_assign: OccurrencesNotToAssign,
}

export const TableLayers = () => {
  const { db } = useElectric()!

  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { active: true, type: { in: vectorLayerTypes } },
      include: { vector_layer_displays: true },
    }),
  )

  return vectorLayers.map((l) => {
    const Component = layerToComponent[l.type]

    return <Component key={l.vector_layer_id} layer={l} />
  })
}
