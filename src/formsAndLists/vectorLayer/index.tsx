import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { VectorLayerForm } from './Form/index.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type VectorLayers from '../../models/public/VectorLayers.ts'

import '../../form.css'

export const VectorLayer = ({ from }) => {
  const { vectorLayerId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  const row: VectorLayers | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
        [value, vectorLayerId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    // set validations to prev without this field
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: vectorLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })

    const newLabel = value?.label
    if (!newLabel) return
    await db.query(
      `UPDATE vector_layers SET label = $1 WHERE vector_layer_id = $2`,
      [newLabel, vectorLayerId],
    )
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: vectorLayerId,
      operation: 'update',
      draft: { label: newLabel },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Vector Layer"
        id={vectorLayerId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header
        row={row}
        from={from}
      />
      <div className="form-container">
        <VectorLayerForm
          // key={JSON.stringify(validations)}
          onChange={onChange}
          validations={validations}
          row={row}
          from={from}
        />
      </div>
    </div>
  )
}
