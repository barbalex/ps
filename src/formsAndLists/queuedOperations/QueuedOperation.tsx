import dayjs from 'dayjs'
import { FaUndoAlt } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'

import { removeOperationAtom } from '../../store.ts'
import { revertOperation } from '../../modules/revertOperation.ts'
import { idFieldFromTable } from '../../modules/idFieldFromTable.ts'

import { value, icon, revertButton } from './QueuedOperation.module.css'

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
        className={value}
        style={valueStyle}
      >{`${dayjs(time).format('YYYY.MM.DD HH:mm:ss')}`}</div>
      <div
        className={value}
        style={valueStyle}
      >
        {table}
      </div>
      <div
        className={value}
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
        className={value}
        style={valueStyle}
      >
        {filter ?
          <pre>
            <code>{JSON.stringify(filter, null, 3)}</code>
          </pre>
        : '(kein Filter)'}
      </div>
      <div
        className={value}
        style={valueStyle}
      >
        {operation}
      </div>
      <div
        className={value}
        style={valueStyle}
      >
        {prev ?
          <pre>
            <code>
              {JSON.stringify(prevWithOnlyTheKeysContainedInDraft, null, 3)}
            </code>
          </pre>
        : '(kein Wert)'}
      </div>
      <div
        className={value}
        style={valueStyle}
      >
        {draft ?
          <pre>
            <code> {JSON.stringify(draft, null, 3)}</code>
          </pre>
        : '(kein Wert)'}
      </div>
      <div
        className={icon}
        style={valueStyle}
      >
        <Button
          title="widerrufen"
          aria-label="widerrufen"
          onClick={onClickRevert}
          size="small"
          className={revertButton}
          icon={<FaUndoAlt />}
        />
      </div>
    </>
  )
}
