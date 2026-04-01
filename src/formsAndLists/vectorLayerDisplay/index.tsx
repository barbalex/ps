import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
// import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SliderFieldWithInput } from '../../components/shared/SliderFieldWithInput.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { MarkerSymbolPicker } from './MarkerSymbolPicker/index.tsx'
import { Header } from './Header.tsx'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary.tsx'
import { ColorPicker } from '../../components/shared/ColorPicker.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { MarkerType } from './MarkerType.tsx'
import { LineCap } from './LineCap.tsx'
import { LineJoin } from './LineJoin.tsx'
import { FillRule } from './FillRule.tsx'
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
  const { formatMessage } = useIntl()

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
        table={formatMessage({
          id: 'fhL4R2',
          defaultMessage: 'Vektor-Ebenen-Darstellung',
        })}
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
  const fields = (
    <>
      <MarkerType onChange={onChange} row={row} />
      {row.marker_type === 'circle' && (
        <TextField
          name="circle_marker_radius"
          label={formatMessage({
            id: 'Ab5CdE',
            defaultMessage: 'Kreis-Radius in Bild-Punkten',
          })}
          value={row.circle_marker_radius}
          onChange={onChange}
          type="number"
          validationMessage={validations?.circle_marker_radius?.message}
          validationState={validations?.circle_marker_radius?.state}
        />
      )}
      {row.marker_type === 'marker' && (
        <>
          <MarkerSymbolPicker onChange={onChange} value={row.marker_symbol} />
          <TextField
            name="marker_size"
            label={formatMessage({
              id: 'Bc6DeF',
              defaultMessage: 'Symbol: Grösse (in Bild-Punkten)',
            })}
            value={row.marker_size}
            onChange={onChange}
            type="number"
            validationMessage={validations?.marker_size?.message}
            validationState={validations?.marker_size?.state}
          />
        </>
      )}
      <ColorPicker
        key={`${row.vector_layer_display_id}/color`}
        label={formatMessage({
          id: 'Cd7EfG',
          defaultMessage: 'Linien und Punkte: Farbe',
        })}
        onChange={onChange}
        color={row.color}
        name="color"
      />
      <TextField
        name="weight"
        label={formatMessage({
          id: 'De8FgH',
          defaultMessage: 'Linien: Breite (in Bild-Punkten)',
        })}
        value={row.weight}
        onChange={onChange}
        type="number"
        validationMessage={validations?.weight?.message}
        validationState={validations?.weight?.state}
      />
      <LineCap onChange={onChange} row={row} />
      <LineJoin onChange={onChange} row={row} />
      <TextField
        name="dash_array"
        label={formatMessage({
          id: 'Gh1IjK',
          defaultMessage: 'Linien: Dash-Array',
        })}
        value={row.dash_array}
        onChange={onChange}
        validationMessage={validations?.dash_array?.message}
        validationState={validations?.dash_array?.state}
      />
      <TextField
        name="dash_offset"
        label={formatMessage({
          id: 'Hi2JkL',
          defaultMessage: 'Linien: Dash-Offset',
        })}
        value={row.dash_offset}
        onChange={onChange}
        validationMessage={validations?.dash_offset?.message}
        validationState={validations?.dash_offset?.state}
      />
      <SwitchField
        label={formatMessage({
          id: 'Ij3KlM',
          defaultMessage: 'Umriss-Linien zeichnen (Polygone und Kreise)',
        })}
        name="stroke"
        value={row.stroke}
        onChange={onChange}
        validationMessage={validations?.stroke?.message}
        validationState={validations?.stroke?.state}
      />
      <SwitchField
        label={formatMessage({
          id: 'Jk4LmN',
          defaultMessage: 'Flächen füllen',
        })}
        name="fill"
        value={row.fill}
        onChange={onChange}
        validationMessage={validations?.fill?.message}
        validationState={validations?.fill?.state}
      />
      <ColorPicker
        id={`${row.id}/fill_color`}
        label={formatMessage({
          id: 'Kl5MnO',
          defaultMessage: 'Füllung: Farbe',
        })}
        name="fill_color"
        onChange={onChange}
        color={row.fill_color}
      />
      <SliderFieldWithInput
        label={formatMessage({
          id: 'Lm6NoP',
          defaultMessage: 'Füllung: Deckkraft (%)',
        })}
        name="fill_opacity_percent"
        value={row.fill_opacity_percent ?? ''}
        onChange={onChange}
        max={100}
        min={0}
        step={5}
      />
      <FillRule onChange={onChange} row={row} />
    </>
  )

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
            vectorLayerDisplayId={vectorLayerDisplayId}
          />
        </div>
        <div className="form-container">{fields}</div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="form-outer-container">
        <Header
          autoFocusRef={autoFocusRef}
          vectorLayerDisplayId={vectorLayerDisplayId}
        />
        <div className="form-container">{fields}</div>
      </div>
    </ErrorBoundary>
  )
}
