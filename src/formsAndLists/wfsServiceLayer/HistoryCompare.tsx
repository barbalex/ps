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

export const WfsServiceLayerHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, wfsServiceId, wfsServiceLayerId, wfsServiceLayerHistoryId } =
    useParams({ strict: false })

  const formPath = `/data/projects/${projectId}/wfs-services/${wfsServiceId}/layers/${wfsServiceLayerId}`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<Record<string, { state: 'error'; message: string }>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM wfs_service_layers WHERE wfs_service_layer_id = $1`,
    [wfsServiceLayerId],
  )
  const row = rowRes?.rows?.[0] as WfsServiceLayers | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || (row as Record<string, any>)[name] === value) return

    try {
      await db.query(
        `UPDATE wfs_service_layers SET ${name} = $1 WHERE wfs_service_layer_id = $2`,
        [value, wfsServiceLayerId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error instanceof Error ? error.message : String(error) },
      }))
      return
    }

    setValidations((prev) => {
       
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
            { state: 'error'; message: string } | undefined
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
    stringifyHistoryValue((history as Record<string, any>)[field])

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
