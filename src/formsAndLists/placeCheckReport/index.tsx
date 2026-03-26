import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { PlaceCheckReportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type PlaceCheckReports from '../../models/public/PlaceCheckReports.ts'

import '../../form.css'

export const PlaceCheckReport = ({ from }) => {
  const { placeCheckReportId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM place_check_reports WHERE place_check_report_id = $1`,
    [placeCheckReportId],
  )
  const row: PlaceCheckReports | undefined = res?.rows?.[0]
  console.log('PlaceCheckReport', { placeCheckReportId, row, res })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE place_check_reports SET ${name} = $1 WHERE place_check_report_id = $2`,
        [value, placeCheckReportId],
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
      table: 'place_check_reports',
      rowIdName: 'place_check_report_id',
      rowId: placeCheckReportId,
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
            id={placeCheckReportId}
          />
        )}
      </div>
    </div>
  )
}
