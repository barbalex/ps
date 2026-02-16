import { MenuItem } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  placesToAssignOccurrenceToAtom,
  addOperationAtom,
} from '../../store.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { resetOccurrenceMarkerPosition } from '../Map/layers/TableLayers/occurrenceMarkers.ts'

interface Props {
  place: { place_id: string; label: string; distance: number }
  occurrenceId: uuid
}

export const Item = ({ place, occurrenceId }: Props) => {
  const setPlacesToAssignOccurrenceTo = useSetAtom(
    placesToAssignOccurrenceToAtom,
  )
  const addOperation = useSetAtom(addOperationAtom)

  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const db = usePGlite()

  const onClick = async () => {
    await db.query(
      `UPDATE occurrences SET place_id = $1, not_to_assign = NULL WHERE occurrence_id = $2`,
      [place.place_id, occurrenceId],
    )
    const occurrenceRes = await db.query(
      `SELECT * FROM occurrences WHERE occurrence_id = $1`,
      [occurrenceId],
    )
    const prev = occurrenceRes?.rows?.[0] ?? {}
    addOperation({
      table: 'occurrences',
      rowIdName: 'occurrence_id',
      rowId: occurrenceId,
      operation: 'update',
      draft: { place_id: place.place_id, not_to_assign: null },
      prev,
    })
    // Reset marker to original position
    resetOccurrenceMarkerPosition(occurrenceId)
    // reset state
    setPlacesToAssignOccurrenceTo(null)
  }

  return (
    <MenuItem onClick={onClick}>{`${place.label} (${formatNumber(
      Math.round(place.distance * 1000),
    )}m)`}</MenuItem>
  )
}
