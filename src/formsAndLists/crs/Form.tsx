import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type CRS from '../../models/public/CRS.ts'

import '../../form.css'

const from = '/data/crs/$crsId'

// this form is rendered from a parent or outlet
export const Component = () => {
  const { crsId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM crs WHERE crs_id = $1`, [crsId])
  const row: CRS | undefined = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(`UPDATE crs SET ${name} = $1 WHERE crs_id = $2`, [
        value,
        crsId,
      ])
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
    db.query(`UPDATE crs SET ${name} = $1 WHERE crs_id = $2`, [value, crsId])
    addOperation({
      table: 'crs',
      rowIdName: 'crs_id',
      rowId: crsId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="CRS" id={crsId} />
  }

  return (
    <>
      <TextField
        label="Code"
        name="code"
        type="code"
        value={row.code ?? ''}
        onChange={onChange}
        validationState={validations.code?.state}
        validationMessage={validations.code?.message}
      />
      <TextField
        label="Name"
        name="name"
        type="name"
        value={row.name ?? ''}
        onChange={onChange}
        validationState={validations.name?.state}
        validationMessage={validations.name?.message}
      />
      <TextArea
        label="Proj4 Value"
        name="proj4"
        type="proj4"
        value={row.proj4 ?? ''}
        onChange={onChange}
        validationState={validations.proj4?.state}
        validationMessage={validations.proj4?.message}
      />
    </>
  )
}
