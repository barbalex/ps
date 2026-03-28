import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import {
  TbArrowLeft,
  TbChevronLeft,
  TbChevronRight,
  TbHistory,
} from 'react-icons/tb'

import { PlaceForm } from './Form.tsx'
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

import styles from './HistoryCompare.module.css'

const { Button, Caption1, Text } = fluentUiReactComponents

type HistoryRow = Record<string, unknown> & {
  updated_at?: string
  updated_by?: string | null
}

const stringifyValue = (value: unknown) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

const areSame = (a: unknown, b: unknown) =>
  stringifyValue(a) === stringifyValue(b)

const formatFieldLabel = (
  field: string,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
  nameSingular: string,
) => {
  switch (field) {
    case 'level':
      return formatMessage({ id: 'bDeHkI', defaultMessage: 'Stufe' })
    case 'parent_id':
      return formatMessage({
        id: 'bElLqQ',
        defaultMessage: 'Übergeordneter Ort',
      })
    case 'since':
      return formatMessage(
        {
          id: 'bEmMrR',
          defaultMessage: 'Seit welchem Jahr existiert die {nameSingular}?',
        },
        { nameSingular },
      )
    case 'until':
      return formatMessage(
        {
          id: 'bEnNsS',
          defaultMessage: 'Bis zu welchem Jahr existierte die {nameSingular}?',
        },
        { nameSingular },
      )
    case 'relevant_for_reports':
      return formatMessage({
        id: 'bEpPuU',
        defaultMessage: 'Relevant für Berichte',
      })
    case 'updated_at':
      return formatMessage({
        id: 'bPlaceHistUpdatedAt',
        defaultMessage: 'Geändert am',
      })
    case 'updated_by':
      return formatMessage({
        id: 'bPlaceHistUpdatedBy',
        defaultMessage: 'Geändert von',
      })
    case 'deleted':
      return formatMessage({
        id: 'bPlaceHistDeleted',
        defaultMessage: 'Gelöscht',
      })
    default:
      return field
  }
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
    if (!row || !selectedHistory) return [] as string[]

    return Object.keys(selectedHistory).filter((field) => {
      if (!visibleCurrentFields.has(field)) return false
      if (excludedDisplayFields.has(field)) return false
      if (
        field === 'updated_at' ||
        field === 'updated_by' ||
        field === 'deleted'
      ) {
        return false
      }
      return !areSame(selectedHistory[field], row[field])
    })
  }, [row, selectedHistory, visibleCurrentFields])

  const displayFields = useMemo(() => {
    if (!selectedHistory) return [] as string[]
    const preferredOrder = [
      'level',
      'parent_id',
      'since',
      'until',
      'relevant_for_reports',
    ]

    const currentFields = preferredOrder.filter(
      (field) =>
        visibleCurrentFields.has(field) &&
        !excludedDisplayFields.has(field) &&
        Object.hasOwn(selectedHistory, field),
    )

    const metaFields = ['updated_at', 'updated_by', 'deleted'].filter((field) =>
      Object.hasOwn(selectedHistory, field),
    )

    return [...currentFields, ...metaFields]
  }, [selectedHistory, visibleCurrentFields])

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

  if (!online || !historiesEnabled) {
    return (
      <div className="form-outer-container">
        <div className="form-header">
          <h1>
            {formatMessage({
              id: 'bPlaceHistoryFeature',
              defaultMessage: 'Geschichte',
            })}
          </h1>
          <Button
            icon={<TbHistory />}
            onClick={() => navigate({ to: '..' })}
            size="small"
          >
            {formatMessage({
              id: 'bPlaceHistoryBack',
              defaultMessage: 'Zurück',
            })}
          </Button>
        </div>
        <div className="form-container">
          <Text>
            {formatMessage({
              id: 'bPlaceHistoryUnavailable',
              defaultMessage:
                'Geschichte ist nur online und bei aktivierter Projekt-Option verfügbar.',
            })}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className="form-outer-container">
      <div className="form-header">
        <h1>
          {formatMessage({
            id: 'bPlaceHistoryFeature',
            defaultMessage: 'Geschichte',
          })}
        </h1>
        <Button
          icon={<TbArrowLeft />}
          onClick={() => navigate({ to: placePath })}
          size="small"
        >
          {formatMessage({
            id: 'bPlaceHistoryBack',
            defaultMessage: 'Zurück',
          })}
        </Button>
      </div>
      <div className={styles.container}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {formatMessage({
              id: 'bPlaceCurrentVersion',
              defaultMessage: 'Aktuelle Version',
            })}
          </h2>
          <div className={styles.leftContent}>
            <PlaceForm
              row={row}
              onChange={onChange}
              validations={validations}
              autoFocusRef={autoFocusRef}
              from={from}
              withContainer={false}
            />
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {formatMessage({
              id: 'bPlaceHistoricalVersion',
              defaultMessage: 'Historische Version',
            })}
          </h2>
          <div className={styles.rightContent}>
            <div className={styles.sliderHeader}>
              <Button
                icon={<TbChevronLeft />}
                disabled={histories.length <= 1}
                onClick={() =>
                  setSelectedHistoryIndex((prev) =>
                    histories.length
                      ? (prev + histories.length - 1) % histories.length
                      : 0,
                  )
                }
              />
              <Caption1>
                {histories.length > 0
                  ? `${selectedHistoryIndex + 1} / ${histories.length}`
                  : '0 / 0'}
              </Caption1>
              <Button
                icon={<TbChevronRight />}
                disabled={histories.length <= 1}
                onClick={() =>
                  setSelectedHistoryIndex((prev) =>
                    histories.length ? (prev + 1) % histories.length : 0,
                  )
                }
              />
            </div>

            <div className={styles.sliderShell}>
              {loadingHistories && (
                <div className={styles.empty}>
                  <Loading />
                </div>
              )}
              {!loadingHistories && historyError && (
                <div className={styles.empty}>{historyError}</div>
              )}
              {!loadingHistories && !historyError && histories.length === 0 && (
                <div className={styles.empty}>
                  {formatMessage({
                    id: 'bPlaceNoHistory',
                    defaultMessage: 'Keine historischen Versionen gefunden.',
                  })}
                </div>
              )}
              {!loadingHistories && !historyError && histories.length > 0 && (
                <div className={styles.valueListScrollerWrap}>
                  <div className={styles.valueListScroller}>
                    <div
                      className={styles.sliderTrack}
                      style={{
                        transform: `translateX(-${selectedHistoryIndex * 100}%)`,
                      }}
                    >
                      {histories.map((history, index) => (
                        <div
                          key={`${history.updated_at ?? 'no-date'}-${index}`}
                          className={styles.slide}
                        >
                          <dl className={styles.valueList}>
                            {displayFields.map((field) => {
                              const value =
                                field === 'deleted'
                                  ? history.deleted
                                    ? formatMessage({
                                        id: 'bCommonYes',
                                        defaultMessage: 'Ja',
                                      })
                                    : formatMessage({
                                        id: 'bCommonNo',
                                        defaultMessage: 'Nein',
                                      })
                                  : stringifyValue(history[field])
                              const isDifferent = diffFields.includes(field)

                              return (
                                <div
                                  key={field}
                                  style={{ display: 'contents' }}
                                >
                                  <dt className={styles.label}>
                                    {formatFieldLabel(
                                      field,
                                      formatMessage,
                                      nameSingular,
                                    )}
                                  </dt>
                                  <dd
                                    className={`${styles.value} ${isDifferent ? styles.valueRed : ''}`}
                                  >
                                    {value}
                                  </dd>
                                </div>
                              )
                            })}
                          </dl>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <Button
                appearance="primary"
                onClick={onRestoreDiffValues}
                disabled={!diffFields.length}
              >
                {formatMessage({
                  id: 'bPlaceRestoreRedValues',
                  defaultMessage: 'Rote Werte wiederherstellen',
                })}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
