import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
// import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

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
  const { vectorLayerDisplayId: vectorLayerDisplayIdFromRouter } = useParams({
    from,
  })
  const vectorLayerDisplayId =
    vectorLayerDisplayIdFromProps ?? vectorLayerDisplayIdFromRouter
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
    [vectorLayerDisplayId],
  )
  const row = res?.rows?.[0]

  const onChange = (e: React.ChangeEvent<HTMLInputElement>, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(
      `UPDATE vector_layer_displays SET ${name} = $1 WHERE vector_layer_display_id = $2`,
      [value, vectorLayerDisplayId],
    )
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
        table="Vector Layer Display"
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
  return (
    <ErrorBoundary>
      <div className="form-outer-container">
        <Header
          autoFocusRef={autoFocusRef}
          from={from}
        />
        <div className="form-container">
          <MarkerType
            onChange={onChange}
            row={row}
          />
          {row.marker_type === 'circle' && (
            <TextField
              name="circle_marker_radius"
              label="Kreis-Radius in Bild-Punkten"
              value={row.circle_marker_radius}
              onChange={onChange}
              type="number"
            />
          )}
          {row.marker_type === 'marker' && (
            <>
              <MarkerSymbolPicker
                onChange={onChange}
                value={row.marker_symbol}
              />
              <TextField
                name="marker_size"
                label="Symbol: Grösse (in Bild-Punkten)"
                value={row.marker_size}
                onChange={onChange}
                type="number"
              />
            </>
          )}
          <ColorPicker
            key={`${row.vector_layer_display_id}/color`}
            label="Linien und Punkte: Farbe"
            onChange={onChange}
            color={row.color}
            name="color"
          />
          <TextField
            name="weight"
            label="Linien: Breite (in Bild-Punkten)"
            value={row.weight}
            onChange={onChange}
            type="number"
          />
          <LineCap
            onChange={onChange}
            row={row}
          />
          <LineJoin
            onChange={onChange}
            row={row}
          />
          <TextField
            name="dash_array"
            label="Linien: Dash-Array"
            value={row.dash_array}
            onChange={onChange}
          />
          <TextField
            name="dash_offset"
            label="Linien: Dash-Offset"
            value={row.dash_offset}
            onChange={onChange}
          />
          <SwitchField
            label="(Umriss-)Linien zeichnen (Polygone und Kreise)"
            name="stroke"
            value={row.stroke}
            onChange={onChange}
          />
          <SwitchField
            label="Flächen füllen"
            name="fill"
            value={row.fill}
            onChange={onChange}
          />
          <ColorPicker
            id={`${row.id}/fill_color`}
            label="Füllung: Farbe"
            name="fill_color"
            onChange={onChange}
            color={row.fill_color}
          />
          <SliderFieldWithInput
            label="Fill: Opacity (%)"
            name="fill_opacity_percent"
            value={row.fill_opacity_percent ?? ''}
            onChange={onChange}
            max={100}
            min={0}
            step={5}
          />
          <FillRule
            onChange={onChange}
            row={row}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
