import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { VectorLayerDisplayForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type VectorLayerDisplays from '../../models/public/VectorLayerDisplays.ts'
import type VectorLayerDisplaysHistory from '../../models/public/VectorLayerDisplaysHistory.ts'

const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId_/histories/$vectorLayerDisplayHistoryId'

export const VectorLayerDisplayHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, vectorLayerId, vectorLayerDisplayId, vectorLayerDisplayHistoryId } =
    useParams({ from, strict: false })
  const displayPath = `/data/projects/${projectId}/vector-layers/${vectorLayerId}/displays/${vectorLayerDisplayId}/vector-layer-display`
  const historyPath = `/data/projects/${projectId}/vector-layers/${vectorLayerId}/displays/${vectorLayerDisplayId}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
    [vectorLayerDisplayId],
  )
  const row = rowRes?.rows?.[0] as VectorLayerDisplays | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

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
      const { [name]: _unused, ...rest } = prev
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

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'fhL4R2', defaultMessage: 'Anzeige' })}
        id={vectorLayerDisplayId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <VectorLayerDisplayForm
        row={row}
        onChange={onChange}
        validations={
          validations as Record<
            string,
            { state: string; message: string } | undefined
          >
        }
      />
    </div>
  )

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      marker_type: { id: 'No8PqR', defaultMessage: 'Punkt-Typ' },
      circle_marker_radius: {
        id: 'Ab5CdE',
        defaultMessage: 'Kreis-Radius in Bild-Punkten',
      },
      marker_symbol: { id: 'vldMarkerSymbol', defaultMessage: 'Symbol' },
      marker_size: {
        id: 'Bc6DeF',
        defaultMessage: 'Symbol: Grösse (in Bild-Punkten)',
      },
      color: { id: 'Cd7EfG', defaultMessage: 'Linien und Punkte: Farbe' },
      weight: { id: 'De8FgH', defaultMessage: 'Linien: Breite (in Bild-Punkten)' },
      line_cap: { id: 'Ef9GhI', defaultMessage: 'Linien: Abschluss' },
      line_join: { id: 'Fg0HiJ', defaultMessage: 'Linien: Ecken' },
      dash_array: { id: 'Gh1IjK', defaultMessage: 'Linien: Dash-Array' },
      dash_offset: { id: 'Hi2JkL', defaultMessage: 'Linien: Dash-Offset' },
      stroke: {
        id: 'Ij3KlM',
        defaultMessage: 'Umriss-Linien zeichnen (Polygone und Kreise)',
      },
      fill: { id: 'Jk4LmN', defaultMessage: 'Flächen füllen' },
      fill_color: { id: 'Kl5MnO', defaultMessage: 'Füllung: Farbe' },
      fill_opacity_percent: {
        id: 'Lm6NoP',
        defaultMessage: 'Füllung: Deckkraft (%)',
      },
      fill_rule: {
        id: 'Mn7OpQ',
        defaultMessage: 'Füllung: Regel, um den Inhalt von Flächen zu bestimmen',
      },
      display_property_value: {
        id: 'vldDisplayPropVal',
        defaultMessage: 'Darstellungs-Wert',
      },
    },
  })

  const formatFieldValue = (
    field: string,
    history: VectorLayerDisplaysHistory,
  ) => stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<VectorLayerDisplaysHistory>
      onBack={() => navigate({ to: displayPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'vector_layer_displays_history',
        rowIdField: 'vector_layer_display_id',
        rowId: vectorLayerDisplayId,
        historyPath,
        routeHistoryId: vectorLayerDisplayHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'vector_layer_displays',
        rowIdName: 'vector_layer_display_id',
        rowId: vectorLayerDisplayId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
