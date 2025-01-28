import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as Form } from './Form.tsx'

// separate from the route because it is also used inside other forms
export const FieldFormFetchingOwnData = memo(
  ({ field_id, autoFocusRef, isInForm = false }) => {
    const db = usePGlite()
    const { results: row } = useLiveQuery(
      db.fields.liveUnique({ where: { field_id } }),
    )

    const onChange = useCallback<InputProps['onChange']>(
      (e, data) => {
        const { name, value } = getValueFromChange(e, data)
        db.fields.update({
          where: { field_id },
          data: { [name]: value },
        })
      },
      [db.fields, field_id],
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
