import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import type { InputOnChangeData } from '@fluentui/react-components'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ActionForm as Form } from './Form.tsx'
import type { Validations } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import '../../form.css'
import type Actions from '../../models/public/Actions.ts'

export const Action = ({ from }: { from: string }) => {
  const { actionId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<Validations>({})
  const { formatMessage } = useIntl()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM actions WHERE action_id = $1`, [
    actionId,
  ])
  const row = res?.rows?.[0] as Actions | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: InputOnChangeData,
  ) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (!row || (row as Record<string, any>)[name] === value) return

    try {
      await db.query(`UPDATE actions SET ${name} = $1 WHERE action_id = $2`, [
        value,
        actionId,
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
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        {!res ? (
          <Loading />
        ) : row ? (
          <Form
            onChange={onChange}
            validations={validations}
            row={row as unknown as Record<string, unknown>}
            autoFocusRef={autoFocusRef}
            from={from}
          />
        ) : (
          <NotFound
            table={formatMessage({ id: 'upa2nh', defaultMessage: 'Massnahme' })}
            id={actionId}
          />
        )}
      </div>
    </div>
  )
}
