import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { GoalForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Goals from '../../models/public/Goals.ts'

import '../../form.css'

export const Goal = ({ from }: { from: string }) => {
  const { goalId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM goals WHERE goal_id = $1`, [goalId])
  const row = res?.rows?.[0] as Goals | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if ((row as Record<string, any>)[name] === value) return

    try {
      await db.query(`UPDATE goals SET ${name} = $1 WHERE goal_id = $2`, [
        value,
        goalId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error instanceof Error ? error.message : String(error) },
      }))
      return
    }
    setValidations((prev) => {
       
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'goals',
      rowIdName: 'goal_id',
      rowId: goalId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        {!res ?
          <Loading />
        : row ?
          <Form
            onChange={onChange}
            row={row}
            autoFocusRef={autoFocusRef}
            from={from}
            validations={validations}
          />
        : <NotFound table="Goal" id={goalId} />
        }
      </div>
    </div>
  )
}
