import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { PersonForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/persons/$personId/'

export const Person = () => {
  const { personId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM persons WHERE person_id = $1`, [
    personId,
  ])
  const row = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(`UPDATE persons SET ${name} = $1 WHERE person_id = $2`, [
      value,
      personId,
    ])
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Person"
        id={personId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          from={from}
        />
      </div>
    </div>
  )
}
