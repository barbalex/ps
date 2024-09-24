import { useRef, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
// import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { SliderFieldWithInput } from '../../components/shared/SliderFieldWithInput.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { MarkerSymbolPicker } from './MarkerSymbolPicker/index.tsx'
import { Header } from './Header.tsx'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary.tsx'
import { ColorPicker } from '../../components/shared/ColorPicker.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import {
  marker_type_enumSchema as markerTypeSchema,
  line_cap_enumSchema as lineCapSchema,
  fill_rule_enumSchema as fillRuleSchema,
} from '../../generated/client/index.ts'

import '../../form.css'

// was used to translate
// const markerTypeGerman = {
//   circle: 'Kreis',
//   marker: 'Symbol',
// }

// not imported from schema as miter-clip not supported by electric-sql
const lineJoinValues = ['arcs', 'bevel', 'miter', 'miter-clip', 'round']

export const Component = ({ vectorLayerDisplayId }) => {
  const { vector_layer_display_id: vectorLayerDisplayIdFromRouter } =
    useParams()
  const vector_layer_display_id =
    vectorLayerDisplayId ?? vectorLayerDisplayIdFromRouter

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.vector_layer_displays.liveUnique({ where: { vector_layer_display_id } }),
  )

  console.log('vectorLayerDisplay', { row, vector_layer_display_id })

  const onChange = useCallback<InputProps['onChange']>(
    (e: React.ChangeEvent<HTMLInputElement>, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.vector_layer_displays.update({
        where: { vector_layer_display_id },
        data: { [name]: value },
      })
    },
    [db.vector_layer_displays, vector_layer_display_id],
  )

  if (!row) return <Loading />

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
          vectorLayerDisplayId={vectorLayerDisplayId}
        />
        <div className="form-container">
          <TextFieldInactive
            label="ID"
            name="vector_layer_display_id"
            value={row.vector_layer_display_id}
          />
          <RadioGroupField
            name="marker_type"
            label="Punkt-Typ"
            list={markerTypeSchema?.options ?? []}
            value={row.marker_type}
            onChange={onChange}
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
          <RadioGroupField
            name="line_cap"
            value={row.line_cap}
            label="Linien: Abschluss"
            list={lineCapSchema?.options ?? []}
            onChange={onChange}
          />
          <RadioGroupField
            name="line_join"
            value={row.line_join}
            label="Linien: Ecken"
            list={lineJoinValues}
            onChange={onChange}
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
          <RadioGroupField
            name="fill_rule"
            value={row.fill_rule}
            label="Füllung: Regel, um den Inhalt von Flächen zu bestimmen"
            list={fillRuleSchema?.options ?? []}
            onChange={onChange}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
