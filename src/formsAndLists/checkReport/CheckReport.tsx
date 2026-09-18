import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { CheckReportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type CheckReports from '../../models/public/CheckReports.ts'

import '../../form.css'

export const CheckReport = ({ from }: { from: string }) => {
  const { checkReportId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM check_reports WHERE place_check_report_id = $1`,
    [checkReportId],
  )
  const row = res?.rows?.[0] as CheckReports | undefined
  console.log('CheckReport', { checkReportId, row, res })

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: object,
  ) => {
    const { name, value } = getValueFromChange(
      e,
      data as Parameters<typeof getValueFromChange>[1],
    )
    // only change if value has changed: maybe only focus entered and left
    if (row?.[name as keyof CheckReports] === value) return

    try {
      await db.query(
        `UPDATE check_reports SET ${name} = $1 WHERE place_check_report_id = $2`,
        [value, checkReportId],
      )
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
      table: 'check_reports',
      rowIdName: 'place_check_report_id',
      rowId: checkReportId,
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
            table={formatMessage({ id: 'bCFgHi', defaultMessage: 'Bericht' })}
            id={checkReportId}
          />
        )}
      </div>
    </div>
  )
}
