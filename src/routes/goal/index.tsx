import { useCallback, useRef, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as Form } from './Form.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { goal_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const { results: row } = useLiveQuery(
    db.goals.liveUnique({ where: { goal_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.goals.update({
        where: { goal_id },
        data: { [name]: value },
      })
    },
    [db.goals, goal_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="goal_id"
          value={row.goal_id ?? ''}
        />
        <Form onChange={onChange} row={row} autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
})
