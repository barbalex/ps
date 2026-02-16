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
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Item } from './Item.tsx'
import {
  confirmAssigningToSingleTargetAtom,
  placesToAssignOccurrenceToAtom,
  addOperationAtom,
} from '../../store.ts'
import { resetOccurrenceMarkerPosition } from '../Map/layers/TableLayers/occurrenceMarkers.ts'
import styles from './index.module.css'

export const OccurrenceAssignChooser = () => {
  const [confirmAssigningToSingleTarget, setConfirmAssigningToSingleTarget] =
    useAtom(confirmAssigningToSingleTargetAtom)
  const [placesToAssignOccurrenceTo, setPlacesToAssignOccurrenceTo] = useAtom(
    placesToAssignOccurrenceToAtom,
  )
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

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

  const onClickRemoveAssignment = async () => {
    const occurrenceId = placesToAssignOccurrenceTo?.occurrence_id
    if (!occurrenceId) return

    await db.query(
      `UPDATE occurrences SET place_id = NULL, not_to_assign = NULL WHERE occurrence_id = $1`,
      [occurrenceId],
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
      draft: { place_id: null, not_to_assign: null },
      prev,
    })
    // Reset marker to original position
    resetOccurrenceMarkerPosition(occurrenceId)
    // reset state
    setPlacesToAssignOccurrenceTo(null)
  }

  const onClickSingleTarget = () =>
    setConfirmAssigningToSingleTarget(!confirmAssigningToSingleTarget)

  if (!placesToAssignOccurrenceTo) return null

  const hasPlaces = placesToAssignOccurrenceTo.places.length > 0
  const hasCurrentAssignment = !!placesToAssignOccurrenceTo.current_place_id

  return (
    <Dialog open={true}>
      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <DialogTitle>
            {hasPlaces ? 'Choose place to assign' : 'No place found'}
          </DialogTitle>
          {placesToAssignOccurrenceTo.places.length > 4 && (
            <div className={styles.titleComment}>The 5 closest are shown</div>
          )}
          <DialogContent>
            {hasPlaces ? (
              <MenuList>
                {placesToAssignOccurrenceTo.places.map((place) => (
                  <Item
                    key={place.place_id}
                    occurrenceId={placesToAssignOccurrenceTo.occurrence_id}
                    place={place}
                  />
                ))}
              </MenuList>
            ) : (
              <div style={{ padding: '12px 0' }}>
                No places found within approximately 40 pixels of the drop
                location. Try dropping closer to a place or zooming in.
              </div>
            )}
          </DialogContent>
          <DialogActions className={styles.actions}>
            {hasPlaces && (
              <Checkbox
                label="Auto-assign when single place found"
                checked={!confirmAssigningToSingleTarget}
                onChange={onClickSingleTarget}
              />
            )}
            {!hasPlaces && hasCurrentAssignment && (
              <Button appearance="primary" onClick={onClickRemoveAssignment}>
                Remove assignment
              </Button>
            )}
            <Button appearance="secondary" onClick={onClickCancel}>
              {hasPlaces ? "Don't assign" : 'Close'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
