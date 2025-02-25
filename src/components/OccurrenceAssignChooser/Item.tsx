import { memo, useCallback } from 'react'
import { MenuItem } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { placesToAssignOccurrenceToAtom } from '../../store.ts'

interface Props {
  place: { place_id: string; label: string; distance: number }
  occurrenceId: uuid
}

export const Item = memo(({ place, occurrenceId }: Props) => {
  const setPlacesToAssignOccurrenceTo = useSetAtom(
    placesToAssignOccurrenceToAtom,
  )
  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const db = usePGlite()

  const onClick = useCallback(async () => {
    db.query(
      `UPDATE occurrences SET place_id = $1, not_to_assign = NULL WHERE occurrence_id = $2`,
      [place.place_id, occurrenceId],
    )
    // reset state
    setPlacesToAssignOccurrenceTo(null)
  }, [db, occurrenceId, place.place_id, setPlacesToAssignOccurrenceTo])

  return (
    <MenuItem onClick={onClick}>{`${
      place.label
    } (${new Intl.NumberFormat().format(
      Math.round(place.distance * 1000),
    )}m)`}</MenuItem>
  )
})
