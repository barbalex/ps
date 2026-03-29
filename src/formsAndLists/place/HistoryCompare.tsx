import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useQuery } from '@tanstack/react-query'
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
  place_history_id?: string
  updated_at?: string
  updated_by?: string | null
}

const getHistoryRecordId = (history: HistoryRow) => {
  if (history.place_history_id) return history.place_history_id
  if (history.updated_at) return String(history.updated_at)
  return null
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
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/histories/$placeHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/histories/$placeHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { pathname } = useLocation()
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
  const online = useAtomValue(onlineAtom)
  const designing = useAtomValue(designingAtom)
  const language = useAtomValue(languageAtom)
  const postgrestClient = useAtomValue(postgrestClientAtom)
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

  const noConnection = !postgrestClient
    ? formatMessage({
        id: 'bPlaceHistoryNoConnection',
        defaultMessage:
          'Keine Server-Verbindung für Geschichtsabfrage verfügbar.',
      })
    : null

  const {
    data: historiesRaw,
    isLoading: loadingHistories,
    error: historyQueryError,
  } = useQuery({
    queryKey: ['places_history', currentPlaceId],
    queryFn: async ({ signal }) => {
      const { data, error } = await postgrestClient!
        .from('places_history')
        .select('*')
        .eq('place_id', currentPlaceId)
        .order('updated_at', { ascending: false })
        .abortSignal(signal)
      if (error) throw new Error(error.message)
      return data
    },
    enabled: online && !!currentPlaceId && !!postgrestClient,
    staleTime: 30_000,
  })

  const histories: HistoryRow[] = useMemo(() => {
    if (!historiesRaw) return []
    const currentRowMissing = !row
    return historiesRaw.map((history, index) => ({
      ...history,
      deleted: currentRowMissing && index === 0,
    })) as HistoryRow[]
  }, [historiesRaw, row])

  const historyError: string | null =
    noConnection ?? (historyQueryError ? historyQueryError.message : null)

  // Keeps the route parameter in sync with available history records by
  // redirecting to the first valid history id when the current one is missing.
  useEffect(() => {
    if (!histories.length) return
    const hasMatchingRouteHistory =
      !!placeHistoryId &&
      histories.some(
        (history) => getHistoryRecordId(history) === placeHistoryId,
      )
    if (hasMatchingRouteHistory) return

    const firstHistoryId = getHistoryRecordId(histories[0])
    if (!firstHistoryId) return

    navigate({ to: `${historyPath}/${firstHistoryId}`, replace: true })
  }, [histories, historyPath, navigate, placeHistoryId])

  const selectedHistoryIndex = useMemo(() => {
    if (!histories.length || !placeHistoryId) return 0
    const index = histories.findIndex(
      (history) => getHistoryRecordId(history) === placeHistoryId,
    )
    return index >= 0 ? index : 0
  }, [histories, placeHistoryId])

  const setSelectedHistoryIndex: Dispatch<SetStateAction<number>> = useCallback(
    (nextIndexOrUpdater) => {
      if (!histories.length) return

      const nextIndex =
        typeof nextIndexOrUpdater === 'function'
          ? nextIndexOrUpdater(selectedHistoryIndex)
          : nextIndexOrUpdater

      const normalizedIndex =
        ((nextIndex % histories.length) + histories.length) % histories.length
      const nextHistoryId = getHistoryRecordId(histories[normalizedIndex])

      if (!nextHistoryId) return
      navigate({ to: `${historyPath}/${nextHistoryId}` })
    },
    [histories, historyPath, navigate, selectedHistoryIndex],
  )

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
      histories={histories}
      selectedHistoryIndex={selectedHistoryIndex}
      setSelectedHistoryIndex={setSelectedHistoryIndex}
      loadingHistories={loadingHistories}
      historyError={historyError}
      displayFields={displayFields}
      differentFields={diffFields}
      formatFieldLabel={formatFieldLabel}
      onRestoreDiffValues={onRestoreDiffValues}
    />
  )
}
