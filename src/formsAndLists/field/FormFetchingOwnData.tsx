import { useCallback, memo } from 'react'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { FieldForm as Form } from './Form.tsx'

// separate from the route because it is also used inside other forms
export const FieldFormFetchingOwnData = memo(
  ({ fieldId, autoFocusRef, isInForm = false, from }) => {
    const db = usePGlite()
    const res = useLiveIncrementalQuery(
      `SELECT * FROM fields WHERE field_id = $1`,
      [fieldId],
      'field_id',
    )
    const row = res?.rows?.[0]

    const onChange = useCallback<InputProps['onChange']>(
      (e, data) => {
        const { name, value } = getValueFromChange(e, data)
        // only change if value has changed: maybe only focus entered and left
        if (row[name] === value) return

        db.query(`UPDATE fields SET ${name} = $1 WHERE field_id = $2`, [
          value,
          fieldId,
        ])
      },
      [db, fieldId, row],
    )

    if (!row) return <Loading />

    return (
      <div className="form-container">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          isInForm={isInForm}
          from={from}
        />
      </div>
    )
  },
)
