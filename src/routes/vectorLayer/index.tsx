import { useCallback, useRef, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as VectorLayerForm } from './Form/index.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { vector_layer_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
    [vector_layer_id],
  )
  const row = result?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.query(
        `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
        [value, vector_layer_id],
      )
      const newLabel = value?.label
      if (!newLabel) return
      db.vector_layers.update({
        where: { vector_layer_id },
        data: { label: newLabel },
      })
    },
    [db, vector_layer_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header
        row={row}
        autoFocusRef={autoFocusRef}
      />
      <div className="form-container">
        <VectorLayerForm
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
})
