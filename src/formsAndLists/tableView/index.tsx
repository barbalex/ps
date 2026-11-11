import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { TableViewForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type TableViews from '../../models/public/TableViews.ts'

import '../../form.css'
import type { FieldChangeData } from '../../components/shared/fieldChange.ts'

export const TableView = () => {
  const { tableViewId } = useParams({ strict: false })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(
    `SELECT * FROM table_views WHERE table_view_id = $1`,
    [tableViewId],
  )
  const row: TableViews | undefined = res?.rows?.[0] as
    TableViews | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    data?: FieldChangeData,
  ) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (
      JSON.stringify((row as unknown as Record<string, unknown>)[name]) ===
      JSON.stringify(value)
    )
      return

    try {
      await db.query(
        `UPDATE table_views SET ${name} = $1 WHERE table_view_id = $2`,
        [value, tableViewId],
      )
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
      table: 'table_views',
      rowIdName: 'table_view_id',
      rowId: tableViewId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Ansicht" id={tableViewId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form
          onChange={
            onChange as unknown as (
              e: React.ChangeEvent<HTMLElement>,
              data?: unknown,
            ) => void
          }
          row={row}
          autoFocusRef={autoFocusRef}
          validations={validations}
        />
      </div>
    </div>
  )
}
