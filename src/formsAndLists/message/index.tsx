import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { DateField } from '../../components/shared/DateField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Messages from '../../models/public/Messages.ts'

import '../../form.css'

const from = '/data/messages/$messageId'

export const Message = () => {
  const { messageId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM messages WHERE message_id = $1`, [
    messageId,
  ])
  const row: Messages | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(`UPDATE messages SET ${name} = $1 WHERE message_id = $2`, [
        value,
        messageId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'messages',
      rowIdName: 'message_id',
      rowId: messageId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Message" id={messageId} />
  }

  return (
    <div className="form-outer-container">
      <Header />
      <div className="form-container">
        <DateField
          label="Date"
          name="date"
          value={row.date}
          onChange={onChange}
          validationState={validations?.date?.state}
          validationMessage={validations?.date?.message}
        />
        <TextField
          label="Message"
          name="message"
          value={row.message ?? ''}
          onChange={onChange}
          autoFocus
          validationState={validations?.message?.state}
          validationMessage={validations?.message?.message}
        />
      </div>
    </div>
  )
}
