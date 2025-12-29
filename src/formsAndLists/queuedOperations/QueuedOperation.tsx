import dayjs from 'dayjs'
import { FaUndoAlt } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'

import { removeOperationAtom } from '../../store.ts'
import { revertOperation } from '../../modules/revertOperation.ts'
import { idFieldFromTable } from '../../modules/idFieldFromTable.ts'

import styles from './QueuedOperation.module.css'

export const QueuedOperation = ({ qo, index }) => {
  const removeOperation = useSetAtom(removeOperationAtom)
  const { id, time, table, rowIdName, rowId, operation, filter, draft, prev } =
    qo

  const onClickRevert = async () => {
    await revertOperation(qo)
    removeOperation(id)
  }

  const valueClass =
    index === 0 ? `${styles.value} ${styles.firstValue}` : styles.value

  const prevWithOnlyTheKeysContainedInDraft = {}
  if (prev && draft) {
    Object.keys(draft).forEach((key) => {
      if (key in prev) {
        prevWithOnlyTheKeysContainedInDraft[key] = prev[key]
      }
    })
  }

  // operation, filter, draft, prev
  return (
    <>
      <div
        className={valueClass}
      >{`${dayjs(time).format('YYYY.MM.DD HH:mm:ss')}`}</div>
      <div className={valueClass}>{table}</div>
      <div className={valueClass}>
        {rowId ??
          draft?.[rowIdName] ??
          prev?.[rowIdName] ??
          draft?.[idFieldFromTable(table)] ??
          prev?.[idFieldFromTable(table)] ??
          '(leer)'}
      </div>
      <div className={valueClass}>
        {filter ? (
          <pre className={styles.pre}>
            <code>{JSON.stringify(filter, null, 3)}</code>
          </pre>
        ) : (
          '(kein Filter)'
        )}
      </div>
      <div className={valueClass}>{operation}</div>
      <div className={valueClass}>
        {prev ? (
          <pre className={styles.pre}>
            <code>
              {JSON.stringify(prevWithOnlyTheKeysContainedInDraft, null, 3)}
            </code>
          </pre>
        ) : (
          '(kein Wert)'
        )}
      </div>
      <div className={valueClass}>
        {draft ? (
          <pre className={styles.pre}>
            <code> {JSON.stringify(draft, null, 3)}</code>
          </pre>
        ) : (
          '(kein Wert)'
        )}
      </div>
      <div className={`${styles.icon} ${valueClass}`}>
        <Button
          title="widerrufen"
          aria-label="widerrufen"
          onClick={onClickRevert}
          size="small"
          className={styles.revertButton}
          icon={<FaUndoAlt />}
        />
      </div>
    </>
  )
}
