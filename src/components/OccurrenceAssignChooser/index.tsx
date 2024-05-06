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
  Checkbox,
} from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'
import { Dismiss24Regular } from '@fluentui/react-icons'

import { useElectric } from '../../ElectricProvider.tsx'
import { Item } from './Item.tsx'

const titleRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  columnGap: '1rem',
}
const titleCommentStyle = {
  fontSize: '0.8rem',
}
const bodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  columnGap: '1rem',
  rowGap: '0.2rem',
}
const actionsStyle = {
  alignSelf: 'flex-end',
}

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

  const onClickSingleTarget = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: {
        confirm_assigning_to_single_target:
          !appState.confirm_assigning_to_single_target,
      },
    })
  }, [
    appState?.app_state_id,
    appState?.confirm_assigning_to_single_target,
    db.app_states,
  ])

  if (!placesToAssignTo) return null

  return (
    <Dialog open={true}>
      <DialogSurface style={{ maxWidth: 'fit-content' }}>
        <DialogBody style={bodyStyle}>
          <div style={titleRowStyle}>
            <DialogTitle>Choose place to assign</DialogTitle>
            <Button
              appearance="subtle"
              aria-label="close"
              icon={<Dismiss24Regular />}
              onClick={onClickCancel}
            />
          </div>
          {placesToAssignTo.places.length > 4 && (
            <div style={titleCommentStyle}>The 5 closest are shown</div>
          )}
          <DialogContent>
            <MenuList>
              {placesToAssignTo.places.map((place) => (
                <Item
                  key={place.place_id}
                  occurrenceId={placesToAssignTo.occurrence_id}
                  place={place}
                  appStateId={appState.app_state_id}
                />
              ))}
            </MenuList>
          </DialogContent>
          <DialogActions style={actionsStyle}>
            <Checkbox
              label="Auto-assign when single place found"
              checked={!appState?.confirm_assigning_to_single_target}
              onChange={onClickSingleTarget}
            />
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
})
