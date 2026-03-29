import type { ReactNode } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { TbArrowLeft, TbChevronLeft, TbChevronRight } from 'react-icons/tb'
import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { Loading } from '../Loading.tsx'
import { stringifyHistoryValue } from './utils.ts'
import { createRestoreDiffValuesHandler } from './createRestoreDiffValuesHandler.ts'
import { useHistoryRecords } from './useHistoryRecords.ts'
import { getDiffFields, getDisplayFields } from './utils.ts'
import { onlineAtom } from '../../../store.ts'

import styles from './index.module.css'

const { Button, Caption1, Text } = fluentUiReactComponents

interface DbLike {
  query(sql: string, params?: unknown[]): Promise<unknown>
}

type AddOperation = (params: {
  table: string
  rowIdName: string
  rowId: string | undefined
  operation: string
  draft: Record<string, unknown>
  prev: Record<string, unknown>
}) => void

type HistoryConfig<THistory extends Record<string, unknown>> = {
  historyTable: string
  rowIdField: string
  rowId: string | undefined
  historyPath: string
  routeHistoryId: string | undefined
  getHistoryRecordId: (history: THistory) => string | null
  currentRow: Record<string, unknown> | undefined
}

type RestoreConfig = {
  db: DbLike
  table: string
  rowIdField: string
  rowIdName: string
  rowId: string | undefined
  excludedRestoreFields: Set<string>
  addOperation: AddOperation
}

type HistoryCompareProps<THistory extends Record<string, unknown>> = {
  onBack: () => void
  leftContent: ReactNode
  loadingHistories?: boolean
  historyError?: string | null
  displayFields?: string[]
  visibleCurrentFields: Set<string>
  excludedDisplayFields: Set<string>
  preferredOrder: string[]
  differentFields?: string[]
  formatFieldLabel: (field: string) => ReactNode
  formatFieldValue?: (field: string, history: THistory) => ReactNode
  row: Record<string, unknown> | undefined
  historyConfig: HistoryConfig<THistory>
  restoreConfig: RestoreConfig
}

export function HistoryCompare<THistory extends Record<string, unknown>>({
  onBack,
  leftContent,
  loadingHistories: loadingHistoriesOverride,
  historyError: historyErrorOverride,
  displayFields: displayFieldsOverride,
  visibleCurrentFields,
  excludedDisplayFields,
  preferredOrder,
  differentFields: differentFieldsOverride,
  formatFieldLabel,
  formatFieldValue,
  row,
  historyConfig,
  restoreConfig,
}: HistoryCompareProps<THistory>) {
  const { formatMessage } = useIntl()
  const online = useAtomValue(onlineAtom)
  const unavailable = !online

  const {
    histories,
    loadingHistories: loadingHistoriesHook,
    historyError: historyErrorHook,
    selectedHistoryIndex,
    setSelectedHistoryIndex,
    selectedHistory,
  } = useHistoryRecords<THistory>(historyConfig)

  const loadingHistories = loadingHistoriesOverride ?? loadingHistoriesHook
  const historyError = historyErrorOverride ?? historyErrorHook

  const diffFields = (() => {
    return getDiffFields({
      row: row as THistory | undefined,
      selectedHistory,
      visibleCurrentFields,
      excludedDisplayFields,
    })
  })()

  const displayFields = (() => {
    return (
      displayFieldsOverride ??
      getDisplayFields({
        selectedHistory,
        preferredOrder,
        visibleCurrentFields,
        excludedDisplayFields,
      })
    )
  })()

  const differentFields = differentFieldsOverride ?? diffFields

  const onRestoreDiffValues = createRestoreDiffValuesHandler({
    db: restoreConfig.db,
    table: restoreConfig.table,
    rowIdField: restoreConfig.rowIdField,
    rowIdName: restoreConfig.rowIdName,
    rowId: restoreConfig.rowId,
    row,
    selectedHistory,
    diffFields,
    excludedRestoreFields: restoreConfig.excludedRestoreFields,
    addOperation: restoreConfig.addOperation,
  })

  const resolveFieldValue = (field: string, history: THistory) => {
    if (formatFieldValue) return formatFieldValue(field, history)

    if (field === 'deleted') {
      return history[field]
        ? formatMessage({ id: 'bCommonYes', defaultMessage: 'Ja' })
        : formatMessage({ id: 'bCommonNo', defaultMessage: 'Nein' })
    }

    return stringifyHistoryValue(history[field])
  }

  if (unavailable) {
    return (
      <div className="form-outer-container">
        <div className="form-header">
          <h1>
            {formatMessage({
              id: 'bPlaceHistoryFeature',
              defaultMessage: 'Geschichte',
            })}
          </h1>
          <Button icon={<TbArrowLeft />} onClick={onBack} size="small">
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
              defaultMessage: 'Geschichte ist nur online verfügbar.',
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
        <Button icon={<TbArrowLeft />} onClick={onBack} size="small">
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
          <div className={styles.leftContent}>{leftContent}</div>
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
              {!loadingHistories && !!historyError && (
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
                          key={`${String(history.updated_at ?? 'no-date')}-${index}`}
                          className={styles.slide}
                        >
                          <dl className={styles.valueList}>
                            {displayFields.map((field) => {
                              const value = resolveFieldValue(field, history)
                              const isDifferent =
                                differentFields.includes(field)

                              return (
                                <div
                                  key={field}
                                  style={{ display: 'contents' }}
                                >
                                  <dt className={styles.label}>
                                    {formatFieldLabel(field)}
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
                disabled={!differentFields.length}
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
