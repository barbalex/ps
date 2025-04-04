import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { VectorLayerForm } from './Form/index.tsx'

import '../../form.css'

export const VectorLayer = memo(({ from }) => {
  const { vectorLayerId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
    [vectorLayerId],
    'vector_layer_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(
        `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
        [value, vectorLayerId],
      )
      const newLabel = value?.label
      if (!newLabel) return
      db.query(
        `UPDATE vector_layers SET label = $1 WHERE vector_layer_id = $2`,
        [newLabel, vectorLayerId],
      )
    },
    [db, row, vectorLayerId],
  )

  if (!row) return <Loading />

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
})
