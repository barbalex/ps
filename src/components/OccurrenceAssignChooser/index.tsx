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
import { Dismiss24Regular } from '@fluentui/react-icons'
import { useAtom } from 'jotai'

import { Item } from './Item.tsx'
import {
  confirmAssigningToSingleTargetAtom,
  placesToAssignOccurrenceToAtom,
} from '../../store.ts'

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

export const OccurrenceAssignChooser = () => {
  const [confirmAssigningToSingleTarget, setConfirmAssigningToSingleTarget] =
    useAtom(confirmAssigningToSingleTargetAtom)
  const [placesToAssignOccurrenceTo, setPlacesToAssignOccurrenceTo] = useAtom(
    placesToAssignOccurrenceToAtom,
  )
  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const onClickCancel = () => setPlacesToAssignOccurrenceTo(null)

  const onClickSingleTarget = () =>
    setConfirmAssigningToSingleTarget(!confirmAssigningToSingleTarget)

  if (!placesToAssignOccurrenceTo) return null

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
          {placesToAssignOccurrenceTo.places.length > 4 && (
            <div style={titleCommentStyle}>The 5 closest are shown</div>
          )}
          <DialogContent>
            <MenuList>
              {placesToAssignOccurrenceTo.places.map((place) => (
                <Item
                  key={place.place_id}
                  occurrenceId={placesToAssignOccurrenceTo.occurrence_id}
                  place={place}
                />
              ))}
            </MenuList>
          </DialogContent>
          <DialogActions style={actionsStyle}>
            <Checkbox
              label="Auto-assign when single place found"
              checked={!confirmAssigningToSingleTarget}
              onChange={onClickSingleTarget}
            />
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
