import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { SubprojectUsers as SubprojectUser } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { DropdownField } from '../../components/shared/DropdownField'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { subproject_user_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.subproject_users.liveUnique({ where: { subproject_user_id } }),
  )

  const row: SubprojectUser = results

  const userWhere = useMemo(() => ({ deleted: false }), [])

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subproject_users.update({
        where: { subproject_user_id },
        data: { [name]: value },
      })
    },
    [db.subproject_users, subproject_user_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="subproject_user_id"
          value={row.subproject_user_id}
        />
        <DropdownField
          label="User"
          name="user_id"
          table="users"
          where={userWhere}
          value={row.user_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <RadioGroupField
          label="Role"
          name="role"
          list={['reader', 'editor', 'manager']}
          value={row.role ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
