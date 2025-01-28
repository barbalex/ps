import { memo, useCallback } from 'react'
import { MenuItem } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { placesToAssignOccurrenceToAtom } from '../../store.ts'

interface Props {
  place: { place_id: string; label: string; distance: number }
  occurrenceId: uuid
  appStateId: uuid
}

export const Item = memo(({ place, occurrenceId, appStateId }: Props) => {
  const setPlacesToAssignOccurrenceTo = useSetAtom(
    placesToAssignOccurrenceToAtom,
  )
  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const db = usePGlite()

  const onClick = useCallback(async () => {
    await db.occurrences.update({
      where: { occurrence_id: occurrenceId },
      data: { place_id: place.place_id, not_to_assign: null },
    })
    // reset state
    setPlacesToAssignOccurrenceTo(null)
  }, [
    db.occurrences,
    occurrenceId,
    place.place_id,
    setPlacesToAssignOccurrenceTo,
  ])

  return (
    <MenuItem onClick={onClick}>{`${
      place.label
    } (${new Intl.NumberFormat().format(
      Math.round(place.distance * 1000),
    )}m)`}</MenuItem>
  )
})
