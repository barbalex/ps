import * as fluentUiReactComponents from '@fluentui/react-components'
const { MenuItem } = fluentUiReactComponents
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  placesToAssignObservationToAtom,
  addOperationAtom,
} from '../../store.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { resetObservationMarkerPosition } from '../Map/layers/TableLayers/observationMarkers.ts'

interface Props {
  place: { place_id: string; label: string; distance: number }
  observationId: uuid
}

export const Item = ({ place, observationId }: Props) => {
  const setPlacesToAssignObservationTo = useSetAtom(
    placesToAssignObservationToAtom,
  )
  const addOperation = useSetAtom(addOperationAtom)

  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const db = usePGlite()

  const onClick = async () => {
    await db.query(
      `UPDATE observations SET place_id = $1, not_to_assign = NULL WHERE observation_id = $2`,
      [place.place_id, observationId],
    )
    const observationRes = await db.query(
      `SELECT * FROM observations WHERE observation_id = $1`,
      [observationId],
    )
    const prev = observationRes?.rows?.[0] ?? {}
    addOperation({
      table: 'observations',
      rowIdName: 'observation_id',
      rowId: observationId,
      operation: 'update',
      draft: { place_id: place.place_id, not_to_assign: null },
      prev,
    })
    // Reset marker to original position
    resetObservationMarkerPosition(observationId)
    // reset state
    setPlacesToAssignObservationTo(null)
  }

  return (
    <MenuItem onClick={onClick}>{`${place.label} (${formatNumber(
      Math.round(place.distance * 1000),
    )}m)`}</MenuItem>
  )
}
