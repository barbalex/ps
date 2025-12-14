import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { VectorLayerForm } from './Form/index.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import '../../form.css'

export const VectorLayer = ({ from }) => {
  const { vectorLayerId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  const row = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(
      `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
      [value, vectorLayerId],
    )
    const newLabel = value?.label
    if (!newLabel) return
    db.query(`UPDATE vector_layers SET label = $1 WHERE vector_layer_id = $2`, [
      newLabel,
      vectorLayerId,
    ])
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
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <div className="form-container">
        <VectorLayerForm
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          from={from}
        />
      </div>
    </div>
  )
}
