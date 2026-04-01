import { useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type ObservationImports from '../../models/public/ObservationImports.ts'
import type ObservationImportsHistory from '../../models/public/ObservationImportsHistory.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/$observationImportId_/histories/$observationImportHistoryId'

export const ObservationImportHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, subprojectId, observationImportId, observationImportHistoryId } =
    useParams({
      from,
      strict: false,
    })

  const formPath = `/data/projects/${projectId}/subprojects/${subprojectId}/observation-imports/${observationImportId}`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const rowRes = useLiveQuery(
    `SELECT * FROM observation_imports WHERE observation_import_id = $1`,
    [observationImportId],
  )
  const row = rowRes?.rows?.[0] as ObservationImports | undefined

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({
          id: 'Orl0K0',
          defaultMessage: 'Beobachtungs-Import',
        })}
        id={observationImportId}
      />
    )
  }

  const geometryMethods = [
    { value: 'XY_COORDINATES', label: 'XY-Koordinaten' },
    { value: 'GEOJSON_FIELD', label: 'GeoJSON-Feld' },
  ]

  const geometryMethodLabel =
    geometryMethods.find((m) => m.value === row.geometry_method)?.label ||
    row.geometry_method ||
    '–'

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      attribution: { id: 'bG2PQR', defaultMessage: 'Zuschreibung' },
      id_field: { id: 'bG3RST', defaultMessage: 'ID-Feld' },
      geometry_method: { id: 'bG4STU', defaultMessage: 'Geometrie-Methode' },
      geojson_geometry_field: {
        id: 'bG5TUV',
        defaultMessage: 'GeoJSON-Geometrie-Feld',
      },
      x_coordinate_field: {
        id: 'bG6UVW',
        defaultMessage: 'X-Koordinaten-Feld',
      },
      y_coordinate_field: {
        id: 'bG7VWX',
        defaultMessage: 'Y-Koordinaten-Feld',
      },
      crs: { id: 'bG8WXY', defaultMessage: 'CRS' },
      previous_import: {
        id: 'bG9XYZ',
        defaultMessage: 'Vorheriger Import',
      },
      download_from_gbif: {
        id: 'bGAYZa',
        defaultMessage: 'Von GBIF herunterladen',
      },
      gbif_error: { id: 'bGBZab', defaultMessage: 'GBIF-Fehler' },
    },
  })

  const formatFieldValue = (
    field: string,
    history: ObservationImportsHistory,
  ) => {
    if (field === 'geometry_method') {
      const value = history[field]
      if (value) {
        return (
          geometryMethods.find((m) => m.value === value)?.label ||
          value
        )
      }
      return value
    }
    return stringifyHistoryValue(history[field])
  }

  const leftContent = (
    <div className="form-container">
      <p>
        <strong>{formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}:</strong> {row.name}
      </p>
      <p>
        <strong>{formatMessage({ id: 'bG2PQR', defaultMessage: 'Zuschreibung' })}:</strong> {row.attribution}
      </p>
      <p>
        <strong>{formatMessage({ id: 'bG3RST', defaultMessage: 'ID-Feld' })}:</strong> {row.id_field}
      </p>
      <p>
        <strong>{formatMessage({ id: 'bG4STU', defaultMessage: 'Geometrie-Methode' })}:</strong> {geometryMethodLabel}
      </p>
      {row.geometry_method === 'XY_COORDINATES' && (
        <>
          <p>
            <strong>{formatMessage({ id: 'bG6UVW', defaultMessage: 'X-Koordinaten-Feld' })}:</strong> {row.x_coordinate_field}
          </p>
          <p>
            <strong>{formatMessage({ id: 'bG7VWX', defaultMessage: 'Y-Koordinaten-Feld' })}:</strong> {row.y_coordinate_field}
          </p>
        </>
      )}
      {row.geometry_method === 'GEOJSON_FIELD' && (
        <p>
          <strong>{formatMessage({ id: 'bG5TUV', defaultMessage: 'GeoJSON-Geometrie-Feld' })}:</strong> {row.geojson_geometry_field}
        </p>
      )}
      <p>
        <strong>{formatMessage({ id: 'bG8WXY', defaultMessage: 'CRS' })}:</strong> {row.crs}
      </p>
      <p>
        <strong>{formatMessage({ id: 'bGAYZa', defaultMessage: 'Von GBIF herunterladen' })}:</strong> {row.download_from_gbif ? 'Ja' : 'Nein'}
      </p>
    </div>
  )

  return (
    <HistoryCompare<ObservationImportsHistory>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'observation_imports_history',
        rowIdField: 'observation_import_id',
        rowId: observationImportId,
        historyPath,
        routeHistoryId: observationImportHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'observation_imports',
        rowIdName: 'observation_import_id',
        rowId: observationImportId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
