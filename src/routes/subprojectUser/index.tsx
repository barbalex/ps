import { useCallback, useRef, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

const userRoles = ['manager', 'editor', 'reader']

import '../../form.css'

export const Component = memo(() => {
  const { subproject_user_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const result = useLiveIncrementalQuery(
    `SELECT * FROM subproject_users WHERE subproject_user_id = $1`,
    [subproject_user_id],
    'subproject_user_id',
  )
  const row = result?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.query(
        `UPDATE subproject_users SET ${name} = $1 WHERE subproject_user_id = $2`,
        [value, subproject_user_id],
      )
    },
    [db, subproject_user_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <DropdownField
          label="User"
          name="user_id"
          table="users"
          value={row.user_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <RadioGroupField
          label="Role"
          name="role"
          list={userRoles}
          value={row.role ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
})
