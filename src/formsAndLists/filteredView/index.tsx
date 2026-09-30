import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { FilteredViewForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type FilteredViews from '../../models/public/FilteredViews.ts'

import '../../form.css'
import type { FieldChangeData } from '../../components/shared/fieldChange.ts'

export const FilteredView = () => {
  const { filteredViewId } = useParams({ strict: false })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(
    `SELECT * FROM filtered_views WHERE filtered_view_id = $1`,
    [filteredViewId],
  )
  const row: FilteredViews | undefined = res?.rows?.[0] as
    FilteredViews | undefined

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
        `UPDATE filtered_views SET ${name} = $1 WHERE filtered_view_id = $2`,
        [value, filteredViewId],
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
      table: 'filtered_views',
      rowIdName: 'filtered_view_id',
      rowId: filteredViewId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Gefilterte Ansicht" id={filteredViewId} />
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
