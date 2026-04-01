import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
// import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { VectorLayerDisplayForm } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import type VectorLayerDisplays from '../../models/public/VectorLayerDisplays.ts'

import '../../form.css'

// was used to translate
// const markerTypeGerman = {
//   circle: 'Kreis',
//   marker: 'Symbol',
// }

export const VectorLayerDisplay = ({
  vectorLayerDisplayId: vectorLayerDisplayIdFromProps,
  from,
}) => {
  // When called from map drawer, we get the ID via props
  // When called from router, we get it from params
  const calledFromMapDrawer = vectorLayerDisplayIdFromProps !== undefined
  const params = useParams({ strict: false })
  const vectorLayerDisplayId =
    vectorLayerDisplayIdFromProps ?? params.vectorLayerDisplayId
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
    [vectorLayerDisplayId],
  )
  const row: VectorLayerDisplays | undefined = res?.rows?.[0]

  const vldsRes = useLiveQuery(
    `SELECT vlds_in_vector_layer FROM projects WHERE project_id = $1`,
    [params.projectId],
  )
  const vldsInVectorLayer = vldsRes?.rows?.[0]?.vlds_in_vector_layer !== false
  const isEmbedded = vldsInVectorLayer && !calledFromMapDrawer

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE vector_layer_displays SET ${name} = $1 WHERE vector_layer_display_id = $2`,
        [value, vectorLayerDisplayId],
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
      table: 'vector_layer_displays',
      rowIdName: 'vector_layer_display_id',
      rowId: vectorLayerDisplayId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Anzeige"
        id={vectorLayerDisplayId}
      />
    )
  }

  // TODO:
  // - add display_property_value
  // - enable choosing field and values from a list of available fields and values:
  //   - from tables
  //   - from wfs
  // - when choosing field, generate a display for every unique value
  // - apply the styles to the vector layer
  // TODO: add missing validations

  if (isEmbedded) {
    return (
      <ErrorBoundary>
        <div
          style={{
            position: 'sticky',
            top: 31,
            zIndex: 2,
            borderTop: '1px solid #bbb',
          }}
        >
          <Header
            autoFocusRef={autoFocusRef}
          />
        </div>
        <div className="form-container">
          <VectorLayerDisplayForm
            row={row}
            onChange={onChange}
            validations={validations}
          />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="form-outer-container">
        <Header
          autoFocusRef={autoFocusRef}
        />
        <div className="form-container">
          <VectorLayerDisplayForm
            row={row}
            onChange={onChange}
            validations={validations}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
