import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  HistoryValueList,
  HistoryValueListScroller,
} from '../../components/shared/HistoryCompare/ValueList.tsx'
import {
  createHistoryFieldLabelFormatter,
  createHistoryFieldValueFormatter,
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
  const {
    projectId,
    subprojectId,
    observationImportId,
    observationImportHistoryId,
  } = useParams({
    from,
    strict: false,
  })

  const formPath = `/data/projects/${projectId}/subprojects/${subprojectId}/observation-imports/${observationImportId}`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

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
    {
      value: 'coordinates',
      label: formatMessage({ id: 'lD2EfG', defaultMessage: 'Koordinaten' }),
    },
    {
      value: 'XY_COORDINATES',
      label: formatMessage({ id: 'lD2EfG', defaultMessage: 'Koordinaten' }),
    },
    {
      value: 'geojson',
      label: formatMessage({ id: 'mH3IjK', defaultMessage: 'GeoJSON' }),
    },
    {
      value: 'GEOJSON_FIELD',
      label: formatMessage({ id: 'mH3IjK', defaultMessage: 'GeoJSON' }),
    },
  ]
  const visibleCurrentFields = new Set(preferredOrder)

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      attribution: { id: 'aTr0bt', defaultMessage: 'Quellenangabe' },
      id_field: { id: 'iDFdLb', defaultMessage: 'ID-Feld' },
      geometry_method: {
        id: 'gMtLbl',
        defaultMessage: 'Wie sind die Geometrien in den Daten enthalten?',
      },
      geojson_geometry_field: {
        id: 'gJsFld',
        defaultMessage: 'GeoJSON-Feld',
      },
      x_coordinate_field: {
        id: 'xCdFld',
        defaultMessage: 'X-Koordinaten-Feld',
      },
      y_coordinate_field: {
        id: 'yCdFld',
        defaultMessage: 'Y-Koordinaten-Feld',
      },
      crs: {
        id: 'cRsLbl',
        defaultMessage: 'Im importierten Datensatz verwendetes Koordinaten-Bezugs-System',
      },
      label_creation: { id: 'Fl3jPw', defaultMessage: 'Bezeichnung' },
      previous_import: {
        id: 'pvImpLb',
        defaultMessage: 'Vorheriger Import',
      },
    },
  })

  const formatFieldValue =
    createHistoryFieldValueFormatter<ObservationImportsHistory>({
      formatMessage,
      fieldValueMap: {
        geometry_method: {
          format: (value) => {
            if (!value) return value
            return (
              geometryMethods.find((method) => method.value === value)?.label ??
              value
            )
          },
        },
      },
    })

  const displayFields = preferredOrder.filter(
    (field) =>
      visibleCurrentFields.has(field) && !excludedDisplayFields.has(field),
  )

  const rowLikeHistory = row as ObservationImportsHistory
  const leftItems = displayFields
    .filter((field) => {
      if (
        field === 'geojson_geometry_field' &&
        !['geojson', 'GEOJSON_FIELD'].includes(
          String(row.geometry_method ?? ''),
        )
      ) {
        return false
      }
      if (
        (field === 'x_coordinate_field' || field === 'y_coordinate_field') &&
        !['coordinates', 'XY_COORDINATES'].includes(
          String(row.geometry_method ?? ''),
        )
      ) {
        return false
      }

      return true
    })
    .map((field) => ({
      key: field,
      label: formatFieldLabel(field),
      value: formatFieldValue(field, rowLikeHistory),
    }))

  const leftContent = (
    <HistoryValueListScroller padded>
      <HistoryValueList items={leftItems} />
    </HistoryValueListScroller>
  )

  return (
    <HistoryCompare<ObservationImportsHistory>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
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
