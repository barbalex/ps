import { useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import {
  undoDeleteAtom,
  undoDeleteRow,
  type UndoDeleteContext,
} from '../modules/undoDelete.ts'
import styles from './UndoDeleteBar.module.css'

// gmail-style undo bar for swipe-to-delete and form-header deletes:
// slides up from the bottom when a row is deleted, auto-hides after a few
// seconds — on all viewports (bottom-left snackbar on wide screens)
export const UndoDeleteBar: React.FC = () => {
  const ctx = useAtomValue(undoDeleteAtom)
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)
  // keep the last context around so the bar can slide down with content
  // instead of vanishing mid-animation
  const lastCtxRef = useRef<UndoDeleteContext | null>(null)

  useEffect(() => {
    if (!ctx) return
    lastCtxRef.current = ctx
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [ctx])

  const display = ctx ?? lastCtxRef.current
  if (!display) return null

  const undo = () => {
    setVisible(false)
    void undoDeleteRow(display)
  }

  return (
    <div className={styles.bar} data-visible={visible} data-testid="undo-delete-bar">
      <span className={styles.text}>
        {formatMessage(
          { id: 'undoDeleteText', defaultMessage: '{name} gelöscht' },
          { name: display.label },
        )}
      </span>
      <button className={styles.undoButton} onClick={undo} type="button">
        {formatMessage({ id: 'undoDeleteUndo', defaultMessage: 'Rückgängig' })}
      </button>
    </div>
  )
}
