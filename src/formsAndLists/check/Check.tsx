import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { CheckForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Checks from '../../models/public/Checks.ts'

import '../../form.css'

export const Check = ({ from }: { from: string }) => {
  const { checkId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM checks WHERE check_id = $1`, [
    checkId,
  ])
  const row = res?.rows?.[0] as Checks | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: object,
  ) => {
    const { name, value } = getValueFromChange(
      e,
      data as Parameters<typeof getValueFromChange>[1],
    )
    // only change if value has changed: maybe only focus entered and left
    if (row?.[name as keyof Checks] === value) return

    try {
      await db.query(`UPDATE checks SET ${name} = $1 WHERE check_id = $2`, [
        value,
        checkId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: (error as Error).message },
      }))
      return
    }
    setValidations((prev) => {
       
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'checks',
      rowIdName: 'check_id',
      rowId: checkId,
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
            row={row}
            autoFocusRef={autoFocusRef}
            from={from}
            validations={validations}
          />
        : <NotFound
            table="Check"
            id={checkId}
          />
        }
      </div>
    </div>
  )
}
