import { useRef, useState } from 'react'
import { useLiveQuery, usePGlite } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type GoalReports from '../../models/public/GoalReports.ts'

import '../../form.css'
import type { FieldChangeData } from '../../components/shared/fieldChange.ts'

export const GoalReport = ({ from }: { from: string }) => {
  const { goalReportId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM goal_reports WHERE goal_report_id = $1`,
    [goalReportId],
  )
  const row = res?.rows?.[0] as GoalReports | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    data?: FieldChangeData,
  ) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if ((row as unknown as Record<string, unknown>)[name] === value) return

    try {
      await db.query(`UPDATE goal_reports SET ${name} = $1 WHERE goal_report_id = $2`, [
        value,
        goalReportId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: {
          state: 'error',
          message: error instanceof Error ? error.message : String(error),
        },
      }))
      return
    }
    setValidations((prev) => {
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'goal_reports',
      rowIdName: 'goal_report_id',
      rowId: goalReportId!,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Goal Report" id={goalReportId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        <TextField
          label={formatMessage({ id: 'bB4FgH', defaultMessage: 'Jahr' })}
          name="year"
          type="number"
          value={row.year ?? ''}
          onChange={onChange}
          validationState={validations?.year?.state}
          validationMessage={validations?.year?.message}
        />
        <Jsonb
          table="goal_reports"
          idField="goal_report_id"
          id={row.goal_report_id}
          data={(row.data ?? {}) as Record<string, unknown>}
          autoFocus
          ref={autoFocusRef}
          from={from}
        />
      </div>
    </div>
  )
}
