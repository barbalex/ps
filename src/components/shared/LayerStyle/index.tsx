import React, {
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useContext,
} from 'react'
import isEqual from 'lodash/isEqual'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { SwitchField } from '../SwitchField'
import { ErrorBoundary } from '../ErrorBoundary'
import { ColorPicker } from '../ColorPicker'
import { dexie } from '../../../dexieClient'
import {
  Vector_layers as VectorLayer,
  Layer_styles as LayerStyle,
} from '../../../generated/client'
import { TextField } from '../TextField'
import { RadioGroupField } from '../RadioGroupField'
import { SliderField } from '../SliderField'
import MarkerSymbolPicker from './MarkerSymbolPicker'
import storeContext from '../../../storeContext'
import { css } from '../../../css'
import { useElectric } from '../../../ElectricProvider'
import { createLayerStyle } from '../../../modules/createRows'

// was used to
const markerTypeGerman = {
  circle: 'Kreis',
  marker: 'Symbol',
}
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

const arrayToOptions = (arr: string[]) =>
  arr.map((v) => ({ value: v, label: v }))

const lineCapValues = arrayToOptions(['butt', 'round', 'square'])
const lineJoinValues = arrayToOptions([
  'arcs',
  'bevel',
  'miter',
  'miter-clip',
  'round',
])
const fillRuleValues = arrayToOptions(['nonzero', 'evenodd'])
const markerTypeValues = ['circle', 'marker'].map((v) => ({
  value: v,
  label: markerTypeGerman[v],
}))

interface Props {
  userMayEdit: boolean
  row: VectorLayer
}

export const LayerStyleForm = ({ userMayEdit, row: layer }: Props) => {
  const { db } = useElectric()!

  const { session } = useContext(storeContext)
  const { vector_layer_id, place_id, check_id, action_id, observation_id } =
    useParams()

  // Get these numbers for tables?
  // No: Manager should be able to set styling before features exist
  const pointCount = layer?.point_count
  const lineCount = layer?.line_count
  const polygonCount = layer?.polygon_count

  const criteria = useMemo(
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
  const row: LayerStyle = useLiveQuery(
    db.layer_styles.liveFirst({ where: criteria }),
  )

  // ensure new one is created if needed
  useEffect(() => {
    const run = async () => {
      if (row) return
      // await own fetch because row is returned only on second render...
      const layerStyle: LayerStyle = await db.layer_styles.findFirst({
        where: criteria,
      })
      if (!layerStyle) {
        console.log('inserting new layer_style')
        const newLayerStyle = createLayerStyle(criteria)
        db.layer_styles.create({ data: newLayerStyle })
      }
    }
    run()
  }, [criteria, db.layer_styles, row])

  const originalRow = useRef<LayerStyle>()
  const rowState = useRef<LayerStyle>()
  useEffect(() => {
    rowState.current = row
    if (!originalRow.current && row) {
      originalRow.current = row
    }
  }, [row])

  // console.log('LayerStyleForm rendering, row:', row)

  const updateOnServer = useCallback(async () => {
    // only update if is changed
    if (isEqual(originalRow.current, rowState.current)) return

    row.updateOnServer({
      was: originalRow.current,
      is: rowState.current,
      session,
    })
    // ensure originalRow is reset too
    originalRow.current = rowState.current
  }, [row, session])

  useEffect(() => {
    window.onbeforeunload = async () => {
      // save any data changed before closing tab or browser
      updateOnServer()
    }
  }, [updateOnServer])

  const onBlur = useCallback(
    async (event) => {
      const { name: field, value, type, valueAsNumber } = event.target
      let newValue = type === 'number' ? valueAsNumber : value
      if ([undefined, '', NaN].includes(newValue)) newValue = null

      // only update if value has changed
      const previousValue = rowState.current[field]
      if (newValue === previousValue) return

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.layer_styles.update(row.id, { [field]: newValue })
    },
    [row],
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
                    onBlur={onBlur}
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
                onBlur={onBlur}
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
                onBlur={onBlur}
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
