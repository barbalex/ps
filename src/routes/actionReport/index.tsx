import { useCallback, useRef, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as Form } from './Form.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { action_report_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const { results: row } = useLiveQuery(
    db.action_reports.liveUnique({
      where: { action_report_id },
    }),
  )

  // console.log('ActionReport', { row, results })

  const onChange = useCallback<InputProps['onChange']>(
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
        <Form onChange={onChange} row={row} autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
})
