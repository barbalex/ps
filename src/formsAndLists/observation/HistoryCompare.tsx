import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { PlaceComboboxWithDistance } from './PlaceComboboxWithDistance.tsx'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type Observations from '../../models/public/Observations.ts'
import type ObservationsHistory from '../../models/public/ObservationsHistory.ts'

export const ObservationHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/subprojects/$subprojectId_/observations-to-assess/$observationId_/histories/$observationHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/observations-not-to-assign/$observationId_/histories/$observationHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/observations/$observationId_/histories/$observationHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/observations/$observationId_/histories/$observationHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    observationId,
    observationHistoryId,
  } = useParams({ from, strict: false })
  const base = `/data/projects/${projectId}/subprojects/${subprojectId}`
  const observationPath = from.includes('observations-to-assess')
    ? `${base}/observations-to-assess/${observationId}`
    : from.includes('observations-not-to-assign')
      ? `${base}/observations-not-to-assign/${observationId}`
      : placeId2
        ? `${base}/places/${placeId}/places/${placeId2}/observations/${observationId}`
        : `${base}/places/${placeId}/observations/${observationId}`
  const historyPath = `${observationPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const row = rowRes?.rows?.[0] as Observations | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE observations SET ${name} = $1 WHERE observation_id = $2`,
        [value, observationId],
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
      table: 'observations',
      rowIdName: 'observation_id',
      rowId: observationId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'obs0Hdr', defaultMessage: 'Beobachtung' })}
        id={observationId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <>
        <SwitchField
          label={formatMessage({
            id: 'obs0Nta',
            defaultMessage: 'Nicht zuzuordnen',
          })}
          name="not_to_assign"
          value={row.not_to_assign}
          onChange={onChange}
          validationState={validations?.not_to_assign?.state}
          validationMessage={validations?.not_to_assign?.message}
        />
        <PlaceComboboxWithDistance
          observationId={observationId}
          value={row.place_id ?? ''}
          onChange={onChange}
          validationState={validations?.place_id?.state}
          validationMessage={validations?.place_id?.message}
        />
        <TextArea
          label={formatMessage({ id: 'obs0Cmt', defaultMessage: 'Kommentar' })}
          name="comment"
          value={row.comment ?? ''}
          onChange={onChange}
          validationState={validations?.comment?.state}
          validationMessage={validations?.comment?.message}
        />
      </>
    </div>
  )

  const visibleCurrentFields = new Set(['not_to_assign', 'place_id', 'comment'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      not_to_assign: { id: 'obs0Nta', defaultMessage: 'Nicht zuzuordnen' },
      place_id: { id: 'obs0Plc', defaultMessage: 'Standort' },
      comment: { id: 'obs0Cmt', defaultMessage: 'Kommentar' },
    },
  })

  const formatFieldValue = (field: string, history: ObservationsHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<ObservationsHistory>
      onBack={() => navigate({ to: observationPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'observations_history',
        rowIdField: 'observation_id',
        rowId: observationId,
        historyPath,
        routeHistoryId: observationHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'observations',
        rowIdName: 'observation_id',
        rowId: observationId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
