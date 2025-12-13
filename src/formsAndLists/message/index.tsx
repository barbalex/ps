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

import '../../form.css'

const from = '/data/messages/$messageId'

export const Message = () => {
  const { messageId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM messages WHERE message_id = $1`, [
    messageId,
  ])
  const row = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(`UPDATE messages SET ${name} = $1 WHERE message_id = $2`, [
      value,
      messageId,
    ])
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Message"
        id={messageId}
      />
    )
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
        />
        <TextField
          label="Message"
          name="message"
          value={row.message ?? ''}
          onChange={onChange}
          autoFocus
        />
      </div>
    </div>
  )
}
