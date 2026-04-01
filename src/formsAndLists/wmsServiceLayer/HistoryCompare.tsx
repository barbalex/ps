import { useParams, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useState } from 'react'

import { WmsServiceLayerForm } from './Form.tsx'
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

import type WmsServiceLayers from '../../models/public/WmsServiceLayers.ts'
import type WmsServiceLayersHistory from '../../models/public/WmsServiceLayersHistory.ts'

const from =
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId_/histories/$wmsServiceLayerHistoryId'

export const WmsServiceLayerHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, wmsServiceId, wmsServiceLayerId, wmsServiceLayerHistoryId } =
    useParams({ from, strict: false })

  const formPath = `/data/projects/${projectId}/wms-services/${wmsServiceId}/layers/${wmsServiceLayerId}`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM wms_service_layers WHERE wms_service_layer_id = $1`,
    [wmsServiceLayerId],
  )
  const row = rowRes?.rows?.[0] as WmsServiceLayers | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE wms_service_layers SET ${name} = $1 WHERE wms_service_layer_id = $2`,
        [value, wmsServiceLayerId],
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
      table: 'wms_service_layers',
      rowIdName: 'wms_service_layer_id',
      rowId: wmsServiceLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'Mn1OpQ', defaultMessage: 'WMS-Dienst-Ebene' })}
        id={wmsServiceLayerId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <WmsServiceLayerForm
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
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      label: { id: 'Fl3jPw', defaultMessage: 'Bezeichnung' },
      queryable: { id: 'No2PqR', defaultMessage: 'Abfragbar' },
      legend_url: { id: 'Op3QrS', defaultMessage: 'Legende URL' },
    },
  })

  const formatFieldValue = (field: string, history: WmsServiceLayersHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<WmsServiceLayersHistory>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'wms_service_layers_history',
        rowIdField: 'wms_service_layer_id',
        rowId: wmsServiceLayerId,
        historyPath,
        routeHistoryId: wmsServiceLayerHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'wms_service_layers',
        rowIdName: 'wms_service_layer_id',
        rowId: wmsServiceLayerId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
