import { useIntl } from 'react-intl'
import { createUsePuck, Puck } from '@puckeditor/core'

import styles from './PuckPropsPanel.module.css'

const usePuckStore = createUsePuck()

/**
 * Props panel for the design editors' custom Puck layout: the fields of the
 * component selected in the preview, with a header to remove it. The default
 * Puck layout provides this panel; the editors render their own layout from
 * Puck.Components/Puck.Preview and must include it separately.
 */
export const PuckPropsPanel = () => {
  const { formatMessage } = useIntl()
  const selectedItem = usePuckStore((s) => s.selectedItem)
  const config = usePuckStore((s) => s.config)
  const dispatch = usePuckStore((s) => s.dispatch)
  const itemSelector = usePuckStore((s) => s.appState.ui.itemSelector)

  const label = selectedItem
    ? (config.components[selectedItem.type]?.label ?? selectedItem.type)
    : null

  const onRemove = () => {
    if (itemSelector?.zone == null) return
    dispatch({
      type: 'remove',
      index: itemSelector.index,
      zone: itemSelector.zone,
    })
  }

  return (
    <div className={styles.panel}>
      {selectedItem ? (
        <>
          <div className={styles.header}>
            <div className={styles.title}>{label}</div>
            <button
              type="button"
              className={styles.removeButton}
              onClick={onRemove}
            >
              {formatMessage({
                id: 'bPuckPanelDelete',
                defaultMessage: 'Löschen',
              })}
            </button>
          </div>
          <Puck.Fields />
        </>
      ) : (
        <div className={styles.emptyState}>
          {formatMessage({
            id: 'bPuckPanelHint',
            defaultMessage:
              'Baustein im Vorschau-Bereich anklicken, um ihn zu bearbeiten',
          })}
        </div>
      )}
    </div>
  )
}
