import { useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { DateField } from '../../components/shared/DateField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { message_id } = useParams()

  const db = usePGlite()
  const result = useLiveQuery(`SELECT * FROM messages WHERE message_id = $1`, [
    message_id,
  ])
  const row = result?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.query(`UPDATE messages SET ${name} = $1 WHERE message_id = $2`, [
        value,
        message_id,
      ])
    },
    [db, message_id],
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
