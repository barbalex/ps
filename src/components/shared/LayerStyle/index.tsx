import React, { useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import type { InputProps } from '@fluentui/react-components'

import { SwitchField } from '../SwitchField'
import { ErrorBoundary } from '../ErrorBoundary'
import { ColorPicker } from '../ColorPicker'
import {
  Vector_layers as VectorLayer,
  Layer_styles as LayerStyle,
} from '../../../generated/client'
import { TextField } from '../TextField'
import { RadioGroupField } from '../RadioGroupField'
import { SliderField } from '../SliderField'
import { MarkerSymbolPicker } from './MarkerSymbolPicker'
import { css } from '../../../css'
import { useElectric } from '../../../ElectricProvider'
import { createLayerStyle } from '../../../modules/createRows'
import { getValueFromChange } from '../../../modules/getValueFromChange'

// was used to translate
// const markerTypeGerman = {
//   circle: 'Kreis',
//   marker: 'Symbol',
// }
const containerStyle = {
  margin: '25px -10px 0 -10px',
}
const titleRowStyle = {
  backgroundColor: 'rgba(248, 243, 254, 1)',
  flexShrink: 0,
  display: 'flex',
  height: '30px',
  justifyContent: 'space-between',
  padding: '0 10px',
  cursor: 'pointer',
  userSelect: 'none',
  position: 'sticky',
  top: '-10px',
  zIndex: 4,
}
const titleStyle = {
  fontWeight: 'bold',
  marginTop: 'auto',
  marginBottom: 'auto',
}
const fieldsContainerStyle = {
  padding: '15px 10px 10px 10px',
}

const lineCapValues = ['butt', 'round', 'square']
const lineJoinValues = ['arcs', 'bevel', 'miter', 'miter-clip', 'round']
const fillRuleValues = ['nonzero', 'evenodd']
const markerTypeValues = ['circle', 'marker']

interface Props {
  userMayEdit: boolean
  row: VectorLayer
}

// TODO: userMayEdit. Was: role in ['account_manager', 'project_manager']
export const LayerStyleForm = ({ userMayEdit = true, row: layer }: Props) => {
  const { db } = useElectric()!

  const { vector_layer_id, place_id, check_id, action_id, observation_id } =
    useParams()

  // Get these numbers for tables?
  // No: Manager should be able to set styling before features exist
  const pointCount = layer?.point_count
  const lineCount = layer?.line_count
  const polygonCount = layer?.polygon_count

  const where = useMemo(
    () =>
      vector_layer_id
        ? { vector_layer_id }
        : check_id
        ? { check_id }
        : action_id
        ? { action_id }
        : observation_id
        ? { observation_id }
        : // place_id needs to come last because it can be hierarchically above the others
        place_id
        ? { place_id }
        : 'none',
    [vector_layer_id, place_id, check_id, action_id, observation_id],
  )
  const { results } = useLiveQuery(db.layer_styles.liveFirst({ where }))
  const row: LayerStyle = results
  console.log('hello LayerStyle, row:', row)

  const isFirstRender = useRef(true)
  // ensure new one is created if needed
  useEffect(() => {
    const run = async () => {
      console.log(
        'hello LayerStyle effect 0, isFirstRender:',
        isFirstRender.current,
      )
      // BUT: this should not run on first render as row is null then anyway
      if (isFirstRender.current) {
        isFirstRender.current = false
        return
      }
      // stop if row already exists
      console.log('hello LayerStyle effect 1, row:', row)
      if (row) return
      console.log('hello LayerStyle effect 2, where:', where)
      // await own fetch because row is returned only on second render...
      const layerStyle: LayerStyle = await db.layer_styles.findFirst({ where })
      console.log('hello LayerStyle effect 3, layerStyle:', layerStyle)
      if (!layerStyle) {
        const newLayerStyle = createLayerStyle(where)
        console.log(
          'hello LayerStyle effect 4, inserting new layer_style:',
          newLayerStyle,
        )
        // need to await. else next effect will run before was inserted
        // so will insert a second one...
        await db.layer_styles.create({ data: newLayerStyle })
      }
    }
    run()
  }, [where, db.layer_styles, row])

  const onChange: InputProps['onChange'] = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.layer_styles.update({
        where: { layer_style_id: row?.layer_style_id },
        data: { [name]: value },
      })
    },
    [db.layer_styles, row?.layer_style_id],
  )

  if (!row) return null // no spinner as is null until enough data input

  return (
    <ErrorBoundary>
      <div style={containerStyle}>
        <div
          style={css({
            ...titleRowStyle,
            '&:first-of-type': {
              marginTop: '-10px',
            },
          })}
        >
          <div style={titleStyle}>Geometrien stylen</div>
        </div>
        <div style={fieldsContainerStyle}>
          {pointCount !== 0 && (
            <>
              <div>
                <RadioGroupField
                  name="marker_type"
                  label="Punkt-Typ"
                  list={markerTypeValues}
                  value={row.marker_type}
                  onChange={onChange}
                  disabled={!userMayEdit}
                />
              </div>
              {row.marker_type === 'circle' && (
                <TextField
                  name="circle_marker_radius"
                  label="Kreis-Radius in Bild-Punkten"
                  value={row.circle_marker_radius}
                  onChange={onChange}
                  type="number"
                  disabled={!userMayEdit}
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
                    disabled={!userMayEdit}
                  />
                  <SliderField
                    name="marker_weight"
                    value={row.marker_weight}
                    label="Symbol: Linien-Dicke"
                    min={0}
                    max={5}
                    step={0.1}
                    onChange={onChange}
                    validationMessage="0 ist dünn, 5 dick. Funktioniert nur bei linien-artigen Symbolen gut"
                  />
                </>
              )}
            </>
          )}
          {(lineCount !== 0 || polygonCount !== 0 || pointCount !== 0) && (
            <>
              <ColorPicker
                id={`${row.id}/color`}
                label="Linien und Punkte: Farbe"
                onChange={onChange}
                color={row.color}
                name="color"
                disabled={!userMayEdit}
              />
              <TextField
                name="opacity"
                label="Linien und Punkte: Deckkraft"
                value={row.opacity}
                onChange={onChange}
                type="number"
                disabled={!userMayEdit}
              />
            </>
          )}
          {(lineCount !== 0 || polygonCount !== 0) && (
            <>
              <TextField
                name="weight"
                label="Linien: Breite (in Bild-Punkten)"
                value={row.weight}
                onChange={onChange}
                type="number"
                disabled={!userMayEdit}
              />
              <div>
                <RadioGroupField
                  name="line_cap"
                  value={row.line_cap}
                  label="Linien: Abschluss"
                  list={lineCapValues}
                  onChange={onChange}
                  disabled={!userMayEdit}
                />
              </div>
              <div>
                <RadioGroupField
                  name="line_join"
                  value={row.line_join}
                  label="Linien: Ecken"
                  list={lineJoinValues}
                  onChange={onChange}
                  disabled={!userMayEdit}
                />
              </div>
              <TextField
                name="dash_array"
                label="Linien: Dash-Array"
                value={row.dash_array}
                onChange={onChange}
                disabled={!userMayEdit}
              />
              <TextField
                name="dash_offset"
                label="Linien: Dash-Offset"
                value={row.dash_offset}
                onChange={onChange}
                disabled={!userMayEdit}
              />
            </>
          )}
          {polygonCount !== 0 && (
            <>
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
                disabled={!userMayEdit}
              />
              <ColorPicker
                id={`${row.id}/fill_color`}
                label="Füllung: Farbe"
                name="fill_color"
                onChange={onChange}
                color={row.fill_color}
                disabled={!userMayEdit}
              />
              <TextField
                name="fill_opacity"
                label="Füllung: Deckkraft / Opazität"
                value={row.fill_opacity}
                onChange={onChange}
                type="number"
                disabled={!userMayEdit}
              />
              <div>
                <RadioGroupField
                  name="fill_rule"
                  value={row.fill_rule}
                  label="Füllung: Regel, um den Inhalt von Flächen zu bestimmen"
                  list={fillRuleValues}
                  onChange={onChange}
                  disabled={!userMayEdit}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
