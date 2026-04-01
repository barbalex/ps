import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { VectorLayerForm } from './Form/index.tsx'
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

import type VectorLayers from '../../models/public/VectorLayers.ts'
import type VectorLayersHistory from '../../models/public/VectorLayersHistory.ts'

const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/histories/$vectorLayerHistoryId'

export const VectorLayerHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, vectorLayerId, vectorLayerHistoryId } = useParams({
    from,
    strict: false,
  })
  const vectorLayerPath = `/data/projects/${projectId}/vector-layers/${vectorLayerId}/vector-layer`
  const historyPath = `/data/projects/${projectId}/vector-layers/${vectorLayerId}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  const row = rowRes?.rows?.[0] as VectorLayers | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
        [value, vectorLayerId],
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
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: vectorLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'fN0sZQ', defaultMessage: 'Vektor-Ebene' })}
        id={vectorLayerId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <VectorLayerForm
        row={row}
        onChange={onChange}
        validations={validations as Record<string, { state: string; message: string }>}
        from={from}
      />
    </div>
  )

  const visibleCurrentFields = new Set([
    'type',
    'wfs_service_id',
    'wfs_service_layer_name',
    'label',
    'max_features',
    'display_by_property',
    'own_table',
    'own_table_level',
    'feature_count',
    'point_count',
    'line_count',
    'polygon_count',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      type: { id: 'xTeBn/', defaultMessage: 'Typ' },
      wfs_service_id: { id: 'Lo5MpR', defaultMessage: 'Web Feature Service (WFS)' },
      wfs_service_layer_name: { id: 'JY1Jke', defaultMessage: 'Ebene' },
      label: { id: 'XkV5yZ', defaultMessage: 'Name' },
      max_features: { id: 'Ps9QtV', defaultMessage: 'Max. Anzahl Objekte' },
      display_by_property: { id: 'Vy5WzB', defaultMessage: 'Anzeigen nach' },
      own_table: { id: 'Yb8ZcF', defaultMessage: 'Eigene Tabelle' },
      own_table_level: { id: 'Zc9AdG', defaultMessage: 'Eigene Tabelle: Stufe' },
      feature_count: { id: 'Ru1SvX', defaultMessage: 'Anzahl Objekte' },
      point_count: { id: 'Sv2TwY', defaultMessage: 'Anzahl Punkte' },
      line_count: { id: 'Tw3UxZ', defaultMessage: 'Anzahl Linien' },
      polygon_count: { id: 'Ux4VyA', defaultMessage: 'Anzahl Polygone' },
    },
  })

  const formatFieldValue = (field: string, history: VectorLayersHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<VectorLayersHistory>
      onBack={() => navigate({ to: vectorLayerPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'vector_layers_history',
        rowIdField: 'vector_layer_id',
        rowId: vectorLayerId,
        historyPath,
        routeHistoryId: vectorLayerHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'vector_layers',
        rowIdName: 'vector_layer_id',
        rowId: vectorLayerId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
