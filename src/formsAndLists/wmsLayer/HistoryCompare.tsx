import { useState, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { WmsLayerForm } from './Form/index.tsx'
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

import type WmsLayers from '../../models/public/WmsLayers.ts'
import type WmsLayersHistory from '../../models/public/WmsLayersHistory.ts'

const from =
  '/data/projects/$projectId_/wms-layers/$wmsLayerId_/histories/$wmsLayerHistoryId'

export const WmsLayerHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, wmsLayerId, wmsLayerHistoryId } = useParams({
    from,
    strict: false,
  })
  const wmsLayerPath = `/data/projects/${projectId}/wms-layers/${wmsLayerId}/wms-layer`
  const historyPath = `/data/projects/${projectId}/wms-layers/${wmsLayerId}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM wms_layers WHERE wms_layer_id = $1`,
    [wmsLayerId],
  )
  const row = rowRes?.rows?.[0] as WmsLayers | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE wms_layers SET ${name} = $1 WHERE wms_layer_id = $2`,
        [value, wmsLayerId],
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
      table: 'wms_layers',
      rowIdName: 'wms_layer_id',
      rowId: wmsLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'Igo7tK', defaultMessage: 'WMS-Ebene' })}
        id={wmsLayerId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <WmsLayerForm
        row={row}
        onChange={onChange}
        validations={
          validations as Record<
            string,
            { state: string; message: string } | undefined
          >
        }
        autoFocusRef={autoFocusRef}
      />
    </div>
  )

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      wms_service_id: {
        id: 'Ed3FgH',
        defaultMessage: 'Web Map Service (WMS)',
      },
      wms_service_layer_name: {
        id: 'wmsLayerName',
        defaultMessage: 'WMS-Ebene',
      },
      label: { id: 'Fl3jPw', defaultMessage: 'Bezeichnung' },
      local_data_size: {
        id: 'wmsLocalDataSize',
        defaultMessage: 'Lokale Datengrösse',
      },
      local_data_bounds: {
        id: 'wmsLocalDataBounds',
        defaultMessage: 'Lokale Datengrenzen',
      },
    },
  })

  const formatFieldValue = (field: string, history: WmsLayersHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<WmsLayersHistory>
      onBack={() => navigate({ to: wmsLayerPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'wms_layers_history',
        rowIdField: 'wms_layer_id',
        rowId: wmsLayerId,
        historyPath,
        routeHistoryId: wmsLayerHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'wms_layers',
        rowIdName: 'wms_layer_id',
        rowId: wmsLayerId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
