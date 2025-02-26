import { useCallback, useRef, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

const userRoles = ['manager', 'editor', 'reader']

import '../../form.css'

export const Component = memo(() => {
  const { project_user_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM project_users WHERE project_user_id = $1`,
    [project_user_id],
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.query(
        `UPDATE project_users SET ${name} = $1 WHERE project_user_id = $2`,
        [value, project_user_id],
      )
    },
    [db, project_user_id],
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
