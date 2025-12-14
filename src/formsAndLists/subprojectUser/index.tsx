import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

const userRoles = ['manager', 'editor', 'reader']

import '../../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId/'

export const SubprojectUser = () => {
  const { subprojectUserId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT * FROM subproject_users WHERE subproject_user_id = $1`,
    [subprojectUserId],
  )
  const row = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(
      `UPDATE subproject_users SET ${name} = $1 WHERE subproject_user_id = $2`,
      [value, subprojectUserId],
    )
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="User"
        id={subprojectUserId}
      />
    )
  }

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
}
