import { useRef, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
// import type { InputProps } from '@fluentui/react-components'

import {
  Vector_layer_displays as VectorLayerDisplay,
  Vector_layers as VectorLayer,
} from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { TextField } from '../../components/shared/TextField'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { SliderField } from '../../components/shared/SliderField'
import { SwitchField } from '../../components/shared/SwitchField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { MarkerSymbolPicker } from './MarkerSymbolPicker'
import { Header } from './Header'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary'
import { ColorPicker } from '../../components/shared/ColorPicker'
import { PropertyField } from './PropertyField'

import '../../form.css'

// was used to translate
// const markerTypeGerman = {
//   circle: 'Kreis',
//   marker: 'Symbol',
// }

const lineCapValues = ['butt', 'round', 'square']
const lineJoinValues = ['arcs', 'bevel', 'miter', 'miter-clip', 'round']
const fillRuleValues = ['nonzero', 'evenodd']
const markerTypeValues = ['circle', 'marker']

type vldResults = {
  results: VectorLayerDisplay
  error: Error
}

type vlResults = {
  results: VectorLayer
  error: Error
}

export const Component = () => {
  const { vector_layer_id, vector_layer_display_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results: row }: vldResults = useLiveQuery(
    db.vector_layer_displays.liveUnique({ where: { vector_layer_display_id } }),
  )
  const { results: vectorLayer }: vlResults = useLiveQuery(
    db.vector_layers.liveUnique({ where: { vector_layer_id } }),
  )
  const displayByPropertyValue = vectorLayer?.display_by_property_value

  console.log('hello vectorLayerDisplay', {
    row,
    vectorLayer,
    displayByPropertyValue,
  })

  const onChange: InputProps['onChange'] = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.vector_layer_displays.update({
        where: { vector_layer_display_id },
        data: { [name]: value },
      })
    },
    [db.vector_layer_displays, vector_layer_display_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // TODO:
  // - add property_field and property_value
  // - enable choosing field and values from a list of available fields and values:
  //   - from tables
  //   - from wfs
  // - when choosing field, generate a display for every unique value
  // - apply the styles to the vector layer
  return (
    <ErrorBoundary>
      <div className="form-outer-container">
        <Header autoFocusRef={autoFocusRef} />
        <div className="form-container">
          <TextFieldInactive
            label="ID"
            name="vector_layer_display_id"
            value={row.vector_layer_display_id}
          />
          {!!displayByPropertyValue && (
            <PropertyField vectorLayerDisplay={row} />
          )}
          <RadioGroupField
            name="marker_type"
            label="Punkt-Typ"
            list={markerTypeValues}
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
            id={`${row.id}/color`}
            label="Linien und Punkte: Farbe"
            onChange={onChange}
            color={row.color}
            name="color"
          />
          <SliderField
            label="Lines and Points: Opacity (%)"
            name="opacity_percent"
            value={row.opacity_percent ?? ''}
            onChange={onChange}
            max={100}
            min={0}
            step={5}
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
            list={lineCapValues}
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
          <SliderField
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
            list={fillRuleValues}
            onChange={onChange}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
