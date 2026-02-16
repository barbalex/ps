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
import { useAtom } from 'jotai'

import { Item } from './Item.tsx'
import {
  confirmAssigningToSingleTargetAtom,
  placesToAssignOccurrenceToAtom,
} from '../../store.ts'
import { resetOccurrenceMarkerPosition } from '../Map/layers/TableLayers/occurrenceMarkers.ts'
import styles from './index.module.css'

export const OccurrenceAssignChooser = () => {
  const [confirmAssigningToSingleTarget, setConfirmAssigningToSingleTarget] =
    useAtom(confirmAssigningToSingleTargetAtom)
  const [placesToAssignOccurrenceTo, setPlacesToAssignOccurrenceTo] = useAtom(
    placesToAssignOccurrenceToAtom,
  )
  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const onClickCancel = () => {
    // Reset the marker position to its original location
    if (placesToAssignOccurrenceTo?.occurrence_id) {
      resetOccurrenceMarkerPosition(placesToAssignOccurrenceTo.occurrence_id)
    }
    setPlacesToAssignOccurrenceTo(null)
  }

  const onClickSingleTarget = () =>
    setConfirmAssigningToSingleTarget(!confirmAssigningToSingleTarget)

  if (!placesToAssignOccurrenceTo) return null

  return (
    <Dialog open={true}>
      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <DialogTitle>Choose place to assign</DialogTitle>
          {placesToAssignOccurrenceTo.places.length > 4 && (
            <div className={styles.titleComment}>The 5 closest are shown</div>
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
          <DialogActions className={styles.actions}>
            <Checkbox
              label="Auto-assign when single place found"
              checked={!confirmAssigningToSingleTarget}
              onChange={onClickSingleTarget}
            />
            <Button appearance="secondary" onClick={onClickCancel}>
              Don't assign
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
