import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  MenuList,
  Checkbox,
} = fluentUiReactComponents
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Item } from './Item.tsx'
import {
  confirmAssigningToSingleTargetAtom,
  placesToAssignObservationToAtom,
  addOperationAtom,
} from '../../store.ts'
import { resetObservationMarkerPosition } from '../Map/layers/TableLayers/observationMarkers.ts'
import styles from './index.module.css'

export const ObservationAssignChooser = () => {
  const [confirmAssigningToSingleTarget, setConfirmAssigningToSingleTarget] =
    useAtom(confirmAssigningToSingleTargetAtom)
  const [placesToAssignObservationTo, setPlacesToAssignObservationTo] = useAtom(
    placesToAssignObservationToAtom,
  )
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  // if multiple places are close to the dropped location,
  // assignToNearestDroppable will set an array of: place_id's, labels and distances
  // if so, a dialog will open to choose the place to assign
  const onClickCancel = () => {
    // Reset the marker position to its original location
    if (placesToAssignObservationTo?.observation_id) {
      resetObservationMarkerPosition(placesToAssignObservationTo.observation_id)
    }
    setPlacesToAssignObservationTo(null)
  }

  const onClickRemoveAssignment = async () => {
    const observationId = placesToAssignObservationTo?.observation_id
    if (!observationId) return

    await db.query(
      `UPDATE observations SET place_id = NULL, not_to_assign = NULL WHERE observation_id = $1`,
      [observationId],
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
      draft: { place_id: null, not_to_assign: null },
      prev,
    })
    // Reset marker to original position
    resetObservationMarkerPosition(observationId)
    // reset state
    setPlacesToAssignObservationTo(null)
  }

  const onClickSingleTarget = () =>
    setConfirmAssigningToSingleTarget(!confirmAssigningToSingleTarget)

  if (!placesToAssignObservationTo) return null

  const hasPlaces = placesToAssignObservationTo.places.length > 0
  const hasCurrentAssignment = !!placesToAssignObservationTo.current_place_id

  return (
    <Dialog open={true}>
      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <DialogTitle>
            {hasPlaces ? 'Choose place to assign' : 'No place found'}
          </DialogTitle>
          {placesToAssignObservationTo.places.length > 4 && (
            <div className={styles.titleComment}>The 5 closest are shown</div>
          )}
          <DialogContent>
            {hasPlaces ? (
              <MenuList>
                {placesToAssignObservationTo.places.map((place) => (
                  <Item
                    key={place.place_id}
                    observationId={placesToAssignObservationTo.observation_id}
                    place={place}
                  />
                ))}
              </MenuList>
            ) : (
              <div className={styles.emptyMessage}>
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
