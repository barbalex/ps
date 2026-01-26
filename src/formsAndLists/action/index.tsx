import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ActionForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import '../../form.css'
import type Actions from '../../models/public/Actions.ts'

export const Action = ({ from }) => {
  const { actionId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM actions WHERE action_id = $1`, [
    actionId,
  ])
  const row: Actions | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(`UPDATE actions SET ${name} = $1 WHERE action_id = $2`, [
        value,
        actionId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'actions',
      rowIdName: 'action_id',
      rowId: actionId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <div className="form-container">
        {!res ?
          <Loading />
        : row ?
          <Form
            onChange={onChange}
            validations={validations}
            row={row}
            autoFocusRef={autoFocusRef}
            from={from}
          />
        : <NotFound
            table="Action"
            id={actionId}
          />
        }
      </div>
    </div>
  )
}
