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

  const valueStyle =
    index === 0 ?
      {
        borderTop: '1px solid rgba(74,20,140,0.1)',
      }
    : {}

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
        className={styles.value}
        style={valueStyle}
      >{`${dayjs(time).format('YYYY.MM.DD HH:mm:ss')}`}</div>
      <div
        className={styles.value}
        style={valueStyle}
      >
        {table}
      </div>
      <div
        className={styles.value}
        style={valueStyle}
      >
        {rowId ??
          draft?.[rowIdName] ??
          prev?.[rowIdName] ??
          draft?.[idFieldFromTable(table)] ??
          prev?.[idFieldFromTable(table)] ??
          '(leer)'}
      </div>
      <div
        className={styles.value}
        style={valueStyle}
      >
        {filter ?
          <pre className={styles.pre}>
            <code>{JSON.stringify(filter, null, 3)}</code>
          </pre>
        : '(kein Filter)'}
      </div>
      <div
        className={styles.value}
        style={valueStyle}
      >
        {operation}
      </div>
      <div
        className={styles.value}
        style={valueStyle}
      >
        {prev ?
          <pre className={styles.pre}>
            <code>
              {JSON.stringify(prevWithOnlyTheKeysContainedInDraft, null, 3)}
            </code>
          </pre>
        : '(kein Wert)'}
      </div>
      <div
        className={styles.value}
        style={valueStyle}
      >
        {draft ?
          <pre className={styles.pre}>
            <code> {JSON.stringify(draft, null, 3)}</code>
          </pre>
        : '(kein Wert)'}
      </div>
      <div
        className={styles.icon}
        style={valueStyle}
      >
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
