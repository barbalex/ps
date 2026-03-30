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

export const ActionReport = ({ from }) => {
  const { placeActionReportId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM action_reports WHERE place_action_report_id = $1`,
    [placeActionReportId],
  )
  const row: ActionReports | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE action_reports SET ${name} = $1 WHERE place_action_report_id = $2`,
        [value, placeActionReportId],
      )
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
      table: 'action_reports',
      rowIdName: 'place_action_report_id',
      rowId: placeActionReportId,
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
            id={placeActionReportId}
          />
        )}
      </div>
    </div>
  )
}
