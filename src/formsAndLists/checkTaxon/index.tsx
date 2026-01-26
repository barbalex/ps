import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type CheckTaxa from '../../models/public/CheckTaxa.ts'

import '../../form.css'

export const CheckTaxon = ({ from }) => {
  const { checkTaxonId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM check_taxa WHERE check_taxon_id = $1`,
    [checkTaxonId],
  )
  const row: CheckTaxa | undefined = res?.rows?.[0]

  // console.log('CheckTaxon', { row, results })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE check_taxa SET ${name} = $1 WHERE check_taxon_id = $2`,
        [value, checkTaxonId],
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
      table: 'check_taxa',
      rowIdName: 'check_taxon_id',
      rowId: checkTaxonId,
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
          <>
            <DropdownField
              label="Taxon"
              name="taxon_id"
              table="taxa"
              value={row.taxon_id ?? ''}
              onChange={onChange}
              autoFocus
              ref={autoFocusRef}
              validationState={validations?.taxon_id?.state}
              validationMessage={validations?.taxon_id?.message}
            />
            <TextField
              label="Value (integer)"
              name="value_integer"
              type="number"
              value={row.value_integer ?? ''}
              onChange={onChange}
              validationState={validations?.value_integer?.state}
              validationMessage={validations?.value_integer?.message}
            />
            <TextField
              label="Value (numeric)"
              name="value_numeric"
              type="number"
              value={row.value_numeric ?? ''}
              onChange={onChange}
              validationState={validations?.value_numeric?.state}
              validationMessage={validations?.value_numeric?.message}
            />
            <TextField
              label="Value (text)"
              name="value_text"
              value={row.value_text ?? ''}
              onChange={onChange}
              validationState={validations?.value_text?.state}
              validationMessage={validations?.value_text?.message}
            />
          </>
        : <NotFound
            table="Check Taxon"
            id={checkTaxonId}
          />
        }
      </div>
    </div>
  )
}
