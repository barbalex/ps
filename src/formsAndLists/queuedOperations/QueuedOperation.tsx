import { useContext } from 'react'
import dayjs from 'dayjs'
import { FaUndoAlt } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'

import { MobxStoreContext } from '../../mobxStoreContext.js'
import { removeOperationAtom } from '../../store.ts'
import { revertOperation } from '../../modules/revertOperation.ts'

import { value, icon, revertButton } from './QueuedQuery.module.css'

const valFromValue = (value) => {
  if (value === true) return 'wahr'
  if (value === false) return 'falsch'
  return value ?? '(leer)'
}

export const QueuedOperation = ({ qo, index }) => {
  const removeOperation = useSetAtom(removeOperationAtom)
  const store = useContext(MobxStoreContext)
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
        {revertTable}
      </div>
      <div
        className={value}
        style={valueStyle}
      >
        {revertId}
      </div>
      <div
        className={value}
        style={valueStyle}
      >
        {isInsert ? 'neuer Datensatz' : revertField}
      </div>
      <div
        className={value}
        style={valueStyle}
      >
        {isInsert ?
          ''
        : revertField ?
          valFromValue(revertValue)
        : JSON.parse(revertValues)}
      </div>
      <div
        className={value}
        style={valueStyle}
      >
        {isInsert ?
          ''
        : revertField ?
          valFromValue(newValue)
        : JSON.parse(newValue)}
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
