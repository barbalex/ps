import { useState, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { WmsServiceForm } from './Form.tsx'
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

import type WmsServices from '../../models/public/WmsServices.ts'
import type WmsServicesHistory from '../../models/public/WmsServicesHistory.ts'

const from =
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/histories/$wmsServiceHistoryId'

export const WmsServiceHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, wmsServiceId, wmsServiceHistoryId } = useParams({
    from,
    strict: false,
  })
  const wmsServicePath = `/data/projects/${projectId}/wms-services/${wmsServiceId}/wms-service`
  const historyPath = `/data/projects/${projectId}/wms-services/${wmsServiceId}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM wms_services WHERE wms_service_id = $1`,
    [wmsServiceId],
  )
  const row = rowRes?.rows?.[0] as WmsServices | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE wms_services SET ${name} = $1 WHERE wms_service_id = $2`,
        [value, wmsServiceId],
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
      table: 'wms_services',
      rowIdName: 'wms_service_id',
      rowId: wmsServiceId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'Pq4RsT', defaultMessage: 'WMS-Dienst' })}
        id={wmsServiceId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <WmsServiceForm
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
      url: { id: 'Yb8ZcE', defaultMessage: 'URL' },
      version: { id: 'Yz9AbC', defaultMessage: 'Version' },
      image_formats: { id: 'wmsImageFormats', defaultMessage: 'Bildformate' },
      image_format: { id: 'Rs6TuV', defaultMessage: 'Bildformat' },
      info_formats: { id: 'wmsInfoFormats', defaultMessage: 'Info-Formate' },
      info_format: { id: 'Za0BcD', defaultMessage: 'Info-Format' },
      default_crs: { id: 'Ab1CdE', defaultMessage: 'Standard-KBS' },
    },
  })

  const formatFieldValue = (field: string, history: WmsServicesHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<WmsServicesHistory>
      onBack={() => navigate({ to: wmsServicePath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'wms_services_history',
        rowIdField: 'wms_service_id',
        rowId: wmsServiceId,
        historyPath,
        routeHistoryId: wmsServiceHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'wms_services',
        rowIdName: 'wms_service_id',
        rowId: wmsServiceId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
