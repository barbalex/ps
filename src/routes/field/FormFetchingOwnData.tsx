import { useCallback, memo } from 'react'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as Form } from './Form.tsx'

// separate from the route because it is also used inside other forms
export const FieldFormFetchingOwnData = memo(
  ({ field_id, autoFocusRef, isInForm = false }) => {
    const db = usePGlite()
    const result = useLiveIncrementalQuery(
      `SELECT * FROM fields WHERE field_id = $1`,
      [field_id],
      'field_id',
    )
    const row = result?.rows?.[0]

    const onChange = useCallback<InputProps['onChange']>(
      (e, data) => {
        const { name, value } = getValueFromChange(e, data)
        db.query(`UPDATE fields SET ${name} = $1 WHERE field_id = $2`, [
          value,
          field_id,
        ])
      },
      [db, field_id],
    )

    if (!row) return <Loading />

    return (
      <div className="form-container">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          isInForm={isInForm}
        />
      </div>
    )
  },
)
