import React, {
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useContext,
} from 'react'
import isEqual from 'lodash/isEqual'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import Checkbox2States from '../Checkbox2States'
import { ErrorBoundary } from '../ErrorBoundary'
import { ColorPicker } from '../ColorPicker'
import {
  dexie,
  LayerStyle,
  LineCapEnum,
  LineJoinEnum,
  FillRuleEnum,
  MarkerTypeEnum,
  VectorLayer,
} from '../../../dexieClient'
import TextField from '../TextField'
import RadioButtonGroup from '../RadioButtonGroup'
import Slider from '../Slider'
import insertLayerStyle from '../../../utils/insertLayerStyle'
import MarkerSymbolPicker from './MarkerSymbolPicker'
import storeContext from '../../../storeContext'
import { css } from '../../../css'

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

interface Props {
  userMayEdit: boolean
  row: VectorLayer
}

export const LayerStyleForm = ({ userMayEdit, row: layer }: Props) => {
  const { session } = useContext(storeContext)
  const { vectorLayerId, tableId } = useParams()

  // Get these numbers for tables?
  // No: Manager should be able to set styling before features exist
  const pointCount = layer?.point_count
  const lineCount = layer?.line_count
  const polygonCount = layer?.polygon_count

  const criteria = useMemo(
    () =>
      tableId
        ? { table_id: tableId }
        : vectorLayerId
        ? { vector_layer_id: vectorLayerId }
        : 'none',
    [vectorLayerId, tableId],
  )
  const row: LayerStyle = useLiveQuery(
    async () => {
      const _row: LayerStyle = await dexie.layer_styles.get(criteria)

      // create layer_style for this table / vector_layer
      // IF it does not yet exist
      // if (!_row) {
      //   _row = await insertLayerStyle({
      //     tableId,
      //     vectorLayerId,
      //   })
      //   /**
      //    * somehow this is FUCKED UP
      //    * first call returns undefined
      //    * second: already exists...
      //    * Unable to add key to index 'vector_layer_id': at least one key does not satisfy the uniqueness requirements
      //    */
      // }

      return _row
    },
    [vectorLayerId, tableId],
    // pass value to be used on first render
    null,
  )

  useEffect(() => {
    const run = async () => {
      if (row === null) {
        // first: check DOUBLE if not already exists
        const layerStyle: LayerStyle = await dexie.layer_styles.get(criteria)
        if (!layerStyle) {
          console.log('inserting new layer_style')
          insertLayerStyle({
            tableId,
            vectorLayerId,
          })
        }
      }
    }
    run()
  }, [criteria, vectorLayerId, row, tableId])

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

  const showDeleted = false

  const lineCapValues = Object.values(LineCapEnum).map((v) => ({
    value: v,
    label: v,
  }))
  const lineJoinValues = Object.values(LineJoinEnum).map((v) => ({
    value: v,
    label: v,
  }))
  const fillRuleValues = Object.values(FillRuleEnum).map((v) => ({
    value: v,
    label: v,
  }))
  const markerTypeValues = Object.values(MarkerTypeEnum).map((v) => ({
    value: v,
    label: markerTypeGerman[v],
  }))

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
        <div
          style={fieldsContainerStyle}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              // focus left the container
              // https://github.com/facebook/react/issues/6410#issuecomment-671915381
              updateOnServer()
            }
          }}
        >
          {showDeleted && (
            <Checkbox2States
              label="gelöscht"
              name="deleted"
              value={row.deleted}
              onBlur={onBlur}
              // error={errors?.project?.deleted}
              disabled={!userMayEdit}
            />
          )}
          {pointCount !== 0 && (
            <>
              <div>
                <RadioButtonGroup
                  name="marker_type"
                  value={row.marker_type}
                  field="marker_type"
                  label="Punkt-Typ"
                  dataSource={markerTypeValues}
                  onBlur={onBlur}
                  // error={errors?.field?.marker_type}
                  disabled={!userMayEdit}
                />
              </div>
              {row.marker_type === 'circle' && (
                <TextField
                  name="circle_marker_radius"
                  label="Kreis-Radius in Bild-Punkten"
                  value={row.circle_marker_radius}
                  onBlur={onBlur}
                  // error={errors?.project?.circle_marker_radius}
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
                    onBlur={onBlur}
                    // error={errors?.project?.marker_size}
                    type="number"
                    disabled={!userMayEdit}
                  />
                  <Slider
                    key={`${row.id}marker_weight/slider`}
                    name="marker_weight"
                    value={row.marker_weight}
                    label="Symbol: Linien-Dicke"
                    min={0}
                    max={5}
                    step={0.1}
                    onBlur={onBlur}
                    helperText="0 ist dünn, 5 dick. Funktioniert nur bei linien-artigen Symbolen gut"
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
                onBlur={onBlur}
                // error={errors?.project?.opacity}
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
                onBlur={onBlur}
                // error={errors?.project?.weight}
                type="number"
                disabled={!userMayEdit}
              />
              <div>
                <RadioButtonGroup
                  name="line_cap"
                  value={row.line_cap}
                  field="line_cap"
                  label="Linien: Abschluss"
                  dataSource={lineCapValues}
                  onBlur={onBlur}
                  // error={errors?.field?.line_cap}
                  disabled={!userMayEdit}
                />
              </div>
              <div>
                <RadioButtonGroup
                  name="line_join"
                  value={row.line_join}
                  field="line_join"
                  label="Linien: Ecken"
                  dataSource={lineJoinValues}
                  onBlur={onBlur}
                  // error={errors?.field?.line_join}
                  disabled={!userMayEdit}
                />
              </div>
              <TextField
                name="dash_array"
                label="Linien: Dash-Array"
                value={row.dash_array}
                onBlur={onBlur}
                // error={errors?.project?.dash_array}
                disabled={!userMayEdit}
              />
              <TextField
                name="dash_offset"
                label="Linien: Dash-Offset"
                value={row.dash_offset}
                onBlur={onBlur}
                // error={errors?.project?.dash_offset}
                disabled={!userMayEdit}
              />
            </>
          )}
          {polygonCount !== 0 && (
            <>
              <Checkbox2States
                label="(Umriss-)Linien zeichnen (Polygone und Kreise)"
                name="stroke"
                value={row.stroke}
                onBlur={onBlur}
                // error={errors?.project?.stroke}
              />
              <Checkbox2States
                label="Flächen füllen"
                name="fill"
                value={row.fill}
                onBlur={onBlur}
                // error={errors?.project?.fill}
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
                onBlur={onBlur}
                // error={errors?.project?.fill_opacity}
                type="number"
                disabled={!userMayEdit}
              />
              <div>
                <RadioButtonGroup
                  name="fill_rule"
                  value={row.fill_rule}
                  field="fill_rule"
                  label="Füllung: Regel, um den Inhalt von Flächen zu bestimmen"
                  dataSource={fillRuleValues}
                  onBlur={onBlur}
                  // error={errors?.field?.fill_rule}
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
