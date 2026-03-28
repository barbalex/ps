import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { PlaceForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  getDiffFields,
  getDisplayFields,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import {
  addOperationAtom,
  designingAtom,
  languageAtom,
  onlineAtom,
  postgrestClientAtom,
} from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'

type HistoryRow = Record<string, unknown> & {
  updated_at?: string
  updated_by?: string | null
}

const excludedDisplayFields = new Set(['sys_period', 'created_at'])
const excludedRestoreFields = new Set([
  'place_id',
  'account_id',
  'subproject_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
  'bbox',
  'deleted',
])

export const PlaceHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/history'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/history'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { projectId, subprojectId, placeId, placeId2 } = useParams({
    from,
    strict: false,
  })
  const currentPlaceId = placeId2 ?? placeId
  const placePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/place`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/place`
  const online = useAtomValue(onlineAtom)
  const designing = useAtomValue(designingAtom)
  const language = useAtomValue(languageAtom)
  const postgrestClient = useAtomValue(postgrestClientAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<Record<string, unknown>>({})
  const [histories, setHistories] = useState<HistoryRow[]>([])
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0)
  const [loadingHistories, setLoadingHistories] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const rowRes = useLiveQuery(`SELECT * FROM places WHERE place_id = $1`, [
    currentPlaceId,
  ])
  const row = rowRes?.rows?.[0] as Record<string, unknown> | undefined

  const projectRes = useLiveQuery(
    `SELECT enable_histories FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const historiesEnabled = projectRes?.rows?.[0]?.enable_histories === true

  const levelForLabel = (row?.level as number | undefined) ?? (placeId2 ? 2 : 1)
  const nameRes = useLiveQuery(
    `SELECT name_singular_${language} FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, levelForLabel],
  )
  const nameSingular =
    nameRes?.rows?.[0]?.[`name_singular_${language}`] ?? 'Population'

  useEffect(() => {
    setSelectedHistoryIndex(0)
  }, [currentPlaceId])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!online || !historiesEnabled || !currentPlaceId || !postgrestClient) {
        if (!cancelled) {
          setHistories([])
          setLoadingHistories(false)
          setHistoryError(
            !postgrestClient
              ? formatMessage({
                  id: 'bPlaceHistoryNoConnection',
                  defaultMessage:
                    'Keine Server-Verbindung für Geschichtsabfrage verfügbar.',
                })
              : null,
          )
        }
        return
      }

      setLoadingHistories(true)
      setHistoryError(null)
      const { data, error } = await postgrestClient
        .from('places_history')
        .select('*')
        .eq('place_id', currentPlaceId)
        .order('updated_at', { ascending: false })

      if (cancelled) return

      if (error) {
        setHistoryError(error.message)
        setHistories([])
      } else {
        const currentRowMissing = !row
        const withDeleted = (data ?? []).map((history, index) => ({
          ...history,
          deleted: currentRowMissing && index === 0,
        }))
        setHistories(withDeleted as HistoryRow[])
      }
      setLoadingHistories(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [
    currentPlaceId,
    online,
    historiesEnabled,
    postgrestClient,
    row,
    formatMessage,
  ])

  const selectedHistory = histories[selectedHistoryIndex]
  const isFilter = pathname.endsWith('filter')
  const visibleCurrentFields = useMemo(() => {
    const visible = new Set(['since', 'until', 'relevant_for_reports'])
    const effectiveLevel =
      (row?.level as number | undefined) ?? (placeId2 ? 2 : 1)

    if (!isFilter) {
      if (designing) visible.add('level')
      if (effectiveLevel === 2) visible.add('parent_id')
    }

    return visible
  }, [designing, isFilter, placeId2, row?.level])

  const diffFields = useMemo(() => {
    return getDiffFields({
      row: row as HistoryRow | undefined,
      selectedHistory,
      visibleCurrentFields,
      excludedDisplayFields,
    })
  }, [row, selectedHistory, visibleCurrentFields])

  const displayFields = useMemo(() => {
    return getDisplayFields({
      selectedHistory,
      preferredOrder: [
        'level',
        'parent_id',
        'since',
        'until',
        'relevant_for_reports',
      ],
      visibleCurrentFields,
      excludedDisplayFields,
    })
  }, [selectedHistory, visibleCurrentFields])

  const formatFieldLabel = useMemo(
    () =>
      createHistoryFieldLabelFormatter({
        formatMessage,
        fieldLabelMap: {
          level: { id: 'bDeHkI', defaultMessage: 'Stufe' },
          parent_id: {
            id: 'bElLqQ',
            defaultMessage: 'Übergeordneter Ort',
          },
          since: {
            id: 'bEmMrR',
            defaultMessage: 'Seit welchem Jahr existiert die {nameSingular}?',
            values: { nameSingular },
          },
          until: {
            id: 'bEnNsS',
            defaultMessage:
              'Bis zu welchem Jahr existierte die {nameSingular}?',
            values: { nameSingular },
          },
          relevant_for_reports: {
            id: 'bEpPuU',
            defaultMessage: 'Relevant für Berichte',
          },
          updated_at: {
            id: 'bPlaceHistUpdatedAt',
            defaultMessage: 'Geändert am',
          },
          updated_by: {
            id: 'bPlaceHistUpdatedBy',
            defaultMessage: 'Geändert von',
          },
          deleted: { id: 'bPlaceHistDeleted', defaultMessage: 'Gelöscht' },
        },
      }),
    [formatMessage, nameSingular],
  )

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

  const onRestoreDiffValues = async () => {
    if (!row || !selectedHistory || !diffFields.length) return

    const restoreEntries = diffFields
      .filter((field) => !excludedRestoreFields.has(field))
      .map((field) => [field, selectedHistory[field]])

    if (!restoreEntries.length) return

    const setClauses = restoreEntries
      .map(([field], i) => `${field} = $${i + 1}`)
      .join(', ')
    const values = restoreEntries.map(([, value]) => value)

    try {
      await db.query(
        `UPDATE places SET ${setClauses} WHERE place_id = $${values.length + 1}`,
        [...values, currentPlaceId],
      )
    } catch (error) {
      console.error(error)
      return
    }

    addOperation({
      table: 'places',
      rowIdName: 'place_id',
      rowId: currentPlaceId,
      operation: 'update',
      draft: Object.fromEntries(restoreEntries),
      prev: { ...row },
    })
  }

  if (!rowRes || !projectRes) return <Loading />

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
      headerTitle={formatMessage({
        id: 'bPlaceHistoryFeature',
        defaultMessage: 'Geschichte',
      })}
      backLabel={formatMessage({
        id: 'bPlaceHistoryBack',
        defaultMessage: 'Zurück',
      })}
      onBack={() => navigate({ to: placePath })}
      unavailable={!online || !historiesEnabled}
      unavailableText={formatMessage({
        id: 'bPlaceHistoryUnavailable',
        defaultMessage:
          'Geschichte ist nur online und bei aktivierter Projekt-Option verfügbar.',
      })}
      leftTitle={formatMessage({
        id: 'bPlaceCurrentVersion',
        defaultMessage: 'Aktuelle Version',
      })}
      rightTitle={formatMessage({
        id: 'bPlaceHistoricalVersion',
        defaultMessage: 'Historische Version',
      })}
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
      histories={histories}
      selectedHistoryIndex={selectedHistoryIndex}
      setSelectedHistoryIndex={setSelectedHistoryIndex}
      loadingHistories={loadingHistories}
      historyError={historyError}
      noHistoryText={formatMessage({
        id: 'bPlaceNoHistory',
        defaultMessage: 'Keine historischen Versionen gefunden.',
      })}
      displayFields={displayFields}
      differentFields={diffFields}
      formatFieldLabel={formatFieldLabel}
      defaultBooleanFieldLabels={{
        deleted: {
          trueLabel: formatMessage({ id: 'bCommonYes', defaultMessage: 'Ja' }),
          falseLabel: formatMessage({
            id: 'bCommonNo',
            defaultMessage: 'Nein',
          }),
        },
      }}
      onRestoreDiffValues={onRestoreDiffValues}
    />
  )
}
