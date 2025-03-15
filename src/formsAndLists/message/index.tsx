import { useCallback, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { DateField } from '../../components/shared/DateField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

const from = '/data/messages/$messageId.tsx'

export const Message = memo(() => {
  const { messageId } = useParams({ from })

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM messages WHERE message_id = $1`,
    [messageId],
    'message_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(`UPDATE messages SET ${name} = $1 WHERE message_id = $2`, [
        value,
        messageId,
      ])
    },
    [db, messageId, row],
  )

  if (!row) return <Loading />

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
})
