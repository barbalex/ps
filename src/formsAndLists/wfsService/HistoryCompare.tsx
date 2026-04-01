import { useState, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { WfsServiceForm } from './Form.tsx'
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

import type WfsServices from '../../models/public/WfsServices.ts'
import type WfsServicesHistory from '../../models/public/WfsServicesHistory.ts'

const from =
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/histories/$wfsServiceHistoryId'

export const WfsServiceHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, wfsServiceId, wfsServiceHistoryId } = useParams({
    from,
    strict: false,
  })
  const wfsServicePath = `/data/projects/${projectId}/wfs-services/${wfsServiceId}/wfs-service`
  const historyPath = `/data/projects/${projectId}/wfs-services/${wfsServiceId}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM wfs_services WHERE wfs_service_id = $1`,
    [wfsServiceId],
  )
  const row = rowRes?.rows?.[0] as WfsServices | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE wfs_services SET ${name} = $1 WHERE wfs_service_id = $2`,
        [value, wfsServiceId],
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
      table: 'wfs_services',
      rowIdName: 'wfs_service_id',
      rowId: wfsServiceId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'X88JDr', defaultMessage: 'WFS-Dienst' })}
        id={wfsServiceId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <WfsServiceForm
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
      info_formats: { id: 'wfsInfoFormats', defaultMessage: 'Info-Formate' },
      info_format: { id: 'Za0BcD', defaultMessage: 'Info-Format' },
      default_crs: { id: 'Ab1CdE', defaultMessage: 'Standard-KBS' },
    },
  })

  const formatFieldValue = (field: string, history: WfsServicesHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<WfsServicesHistory>
      onBack={() => navigate({ to: wfsServicePath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'wfs_services_history',
        rowIdField: 'wfs_service_id',
        rowId: wfsServiceId,
        historyPath,
        routeHistoryId: wfsServiceHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'wfs_services',
        rowIdName: 'wfs_service_id',
        rowId: wfsServiceId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
