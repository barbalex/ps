import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { PlaceForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom, designingAtom, languageAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

export const PlaceHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/histories/$placeHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/histories/$placeHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, subprojectId, placeId, placeId2, placeHistoryId } =
    useParams({
      from,
      strict: false,
    })
  const currentPlaceId = placeId2 ?? placeId
  const placePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/place`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/place`
  const historyPath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/histories`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/histories`
  const designing = useAtomValue(designingAtom)
  const language = useAtomValue(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(`SELECT * FROM places WHERE place_id = $1`, [
    currentPlaceId,
  ])
  const row = rowRes?.rows?.[0] as Record<string, unknown> | undefined

  const levelForLabel = (row?.level as number | undefined) ?? (placeId2 ? 2 : 1)
  const nameRes = useLiveQuery(
    `SELECT name_singular_${language} FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, levelForLabel],
  )
  const nameSingular =
    nameRes?.rows?.[0]?.[`name_singular_${language}`] ??
    `Place Level ${levelForLabel}`

  const visibleCurrentFields = new Set([
    'since',
    'until',
    'relevant_for_reports',
    ...(designing ? ['level'] : []),
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      level: { id: 'bDeHkI', defaultMessage: 'Stufe' },
      since: {
        id: 'bEmMrR',
        defaultMessage: 'Seit welchem Jahr existiert die {nameSingular}?',
        values: { nameSingular },
      },
      until: {
        id: 'bEnNsS',
        defaultMessage: 'Bis zu welchem Jahr existierte die {nameSingular}?',
        values: { nameSingular },
      },
      relevant_for_reports: {
        id: 'bEpPuU',
        defaultMessage: 'Relevant für Berichte',
      },
    },
  })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(`UPDATE places SET ${name} = $1 WHERE place_id = $2`, [
        value,
        currentPlaceId,
      ])
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
      table: 'places',
      rowIdName: 'place_id',
      rowId: currentPlaceId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'fz2place', defaultMessage: 'Ort' })}
        id={currentPlaceId}
      />
    )
  }

  return (
    <HistoryCompare
      onBack={() => navigate({ to: placePath })}
      leftContent={
        <PlaceForm
          row={row}
          onChange={onChange}
          validations={validations}
          autoFocusRef={autoFocusRef}
          from={from}
          withContainer={false}
        />
      }
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      row={row}
      historyConfig={{
        historyTable: 'places_history',
        rowIdField: 'place_id',
        rowId: currentPlaceId,
        historyPath,
        routeHistoryId: placeHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'places',
        rowIdName: 'place_id',
        rowId: currentPlaceId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
