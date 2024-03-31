import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'
import { Loading } from '../../components/shared/Loading'

import '../../form.css'

export const Component = () => {
  const { action_report_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.action_reports.liveUnique({
      where: { action_report_id },
    }),
  )

  // console.log('ActionReport', { row, results })

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.action_reports.update({
        where: { action_report_id },
        data: { [name]: value },
      })
    },
    [db.action_reports, action_report_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="action_report_id"
          value={row.action_report_id ?? ''}
        />
        <TextField
          label="Year"
          name="year"
          value={row.year ?? ''}
          type="number"
          onChange={onChange}
        />
        <Jsonb
          table="action_reports"
          idField="action_report_id"
          id={row.action_report_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
}
