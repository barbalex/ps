import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { WfsServiceLayerForm } from './Form.tsx'
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

import type WfsServiceLayers from '../../models/public/WfsServiceLayers.ts'
import type WfsServiceLayersHistory from '../../models/public/WfsServiceLayersHistory.ts'

const from =
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId_/histories/$wfsServiceLayerHistoryId'

export const WfsServiceLayerHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, wfsServiceId, wfsServiceLayerId, wfsServiceLayerHistoryId } =
    useParams({ from, strict: false })

  const formPath = `/data/projects/${projectId}/wfs-services/${wfsServiceId}/layers/${wfsServiceLayerId}`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM wfs_service_layers WHERE wfs_service_layer_id = $1`,
    [wfsServiceLayerId],
  )
  const row = rowRes?.rows?.[0] as WfsServiceLayers | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE wfs_service_layers SET ${name} = $1 WHERE wfs_service_layer_id = $2`,
        [value, wfsServiceLayerId],
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
      table: 'wfs_service_layers',
      rowIdName: 'wfs_service_layer_id',
      rowId: wfsServiceLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'Cb1DcE', defaultMessage: 'WFS-Dienst-Ebene' })}
        id={wfsServiceLayerId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <WfsServiceLayerForm
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
    },
  })

  const formatFieldValue = (field: string, history: WfsServiceLayersHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<WfsServiceLayersHistory>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'wfs_service_layers_history',
        rowIdField: 'wfs_service_layer_id',
        rowId: wfsServiceLayerId,
        historyPath,
        routeHistoryId: wfsServiceLayerHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'wfs_service_layers',
        rowIdName: 'wfs_service_layer_id',
        rowId: wfsServiceLayerId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
