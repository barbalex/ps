import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ActionReportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type ActionReports from '../../models/public/ActionReports.ts'

import '../../form.css'

export const ActionReport = ({ from }: { from: string }) => {
  const { actionReportId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM action_reports WHERE place_action_report_id = $1`,
    [actionReportId],
  )
  const row = res?.rows?.[0] as ActionReports | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    if ((row as Record<string, any>)[name] === value) return

    try {
      await db.query(
        `UPDATE action_reports SET ${name} = $1 WHERE place_action_report_id = $2`,
        [value, actionReportId],
      )
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
      table: 'action_reports',
      rowIdName: 'place_action_report_id',
      rowId: actionReportId,
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
            row={row}
            autoFocusRef={autoFocusRef}
            from={from}
          />
        ) : (
          <NotFound
            table={formatMessage({
              id: 'YMGqLf',
              defaultMessage: 'Massnahmen-Bericht',
            })}
            id={actionReportId}
          />
        )}
      </div>
    </div>
  )
}
