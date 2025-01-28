import { useCallback, useRef, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as VectorLayerForm } from './Form/index.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { vector_layer_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const { results: row } = useLiveQuery(
    db.vector_layers.liveUnique({
      where: { vector_layer_id },
      include: {
        layer_presentations: true,
        // wfs_services: { wfs_service_layers: true }, // returns undefined
        wfs_services: true,
      },
    }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.vector_layers.update({
        where: { vector_layer_id },
        data: { [name]: value },
      })
      const newLabel = value?.label
      if (!newLabel) return
      db.vector_layers.update({
        where: { vector_layer_id },
        data: { label: newLabel },
      })
    },
    [db.vector_layers, vector_layer_id],
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
