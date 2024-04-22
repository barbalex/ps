import { memo, useCallback } from 'react'
import { MenuItem } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { Places as Place } from '../../generated/client'

interface Props {
  place: Place
  occurrenceId: uuid
}

export const Item = memo(({ place, occurrenceId }: Props) => {
  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const { db } = useElectric()!

  const onClick = useCallback(() => {
    db.occurrences.update({
      where: { occurrence_id: occurrenceId },
      data: { place_id, not_to_assign: false },
    })
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: { places_to_assign_occurrence_to: placesToAssignOccurrenceTo },
    })
  }, [db.app_states, db.occurrences, occurrenceId])

  return (
    <MenuItem key={place.place_id} onClick={onClick}>{`${
      place.label
    } (${new Intl.NumberFormat().format(
      Math.round(place.distance * 1000),
    )}m)`}</MenuItem>
  )
})
