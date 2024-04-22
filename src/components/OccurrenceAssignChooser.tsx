import { memo, useCallback } from 'react'
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  MenuList,
  MenuItem,
} from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../ElectricProvider'

export const OccurrenceAssignChooser = memo(() => {
  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const { user: authUser } = useCorbadoSession()
  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const placesToAssignTo = appState?.places_to_assign_occurrence_to

  const onClickCancel = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: { places_to_assign_occurrence_to: null },
    })
  }, [appState?.app_state_id, db.app_states])

  if (!placesToAssignTo) return null

  return (
    <Dialog open={true}>
      <DialogSurface style={{ maxWidth: 'fit-content' }}>
        <DialogBody
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DialogTitle>Choose where to assign</DialogTitle>
          <DialogContent>
            <MenuList>
              {placesToAssignTo.places.map((place) => (
                <MenuItem key={place.place_id}>{`${place.label} (${
                  place.distance * 1000
                }m)`}</MenuItem>
              ))}
            </MenuList>
          </DialogContent>
          <DialogActions style={{ alignSelf: 'flex-end' }}>
            <Button onClick={onClickCancel} appearance="secondary">
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
})
