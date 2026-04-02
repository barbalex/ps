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
import { HistoryValueList, HistoryValueListScroller } from './ValueList.tsx'
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

type HistoryConfig = {
  historyTable: string
  rowIdField: string
  rowId: string | undefined
  historyPath: string
  routeHistoryId: string | undefined
  currentRow: Record<string, unknown> | undefined
}

type RestoreConfig = {
  db: DbLike
  table: string
  rowIdName: string
  rowId: string | undefined
  excludedRestoreFields: Set<string>
  addOperation: AddOperation
}

type HistoryCompareProps<THistory extends Record<string, unknown>> = {
  onBack: () => void
  leftContent: ReactNode
  leftHistories?: THistory[]
  leftDisplayFields?: string[]
  leftDifferentFields?: string[]
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
  historyConfig: HistoryConfig
  restoreConfig: RestoreConfig
}

export function HistoryCompare<THistory extends Record<string, unknown>>({
  onBack,
  leftContent,
  leftHistories,
  leftDisplayFields,
  leftDifferentFields,
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
  const resolvedLeftHistories = leftHistories ?? []
  const resolvedLeftDisplayFields = leftDisplayFields ?? displayFields
  const resolvedLeftDifferentFields = leftDifferentFields ?? []

  const onRestoreDiffValues = createRestoreDiffValuesHandler({
    db: restoreConfig.db,
    table: restoreConfig.table,
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

  const renderHistoryRows = ({
    historiesToRender,
    selectedIndex,
    fields,
    differentFieldsToRender,
  }: {
    historiesToRender: THistory[]
    selectedIndex: number
    fields: string[]
    differentFieldsToRender: string[]
  }) => (
    <HistoryValueListScroller>
      <div
        className={styles.sliderTrack}
        style={{
          transform: `translateX(-${selectedIndex * 100}%)`,
        }}
      >
        {historiesToRender.map((history, index) => (
          <div
            key={`${String(history.updated_at ?? 'no-date')}-${index}`}
            className={styles.slide}
          >
            <HistoryValueList
              items={fields.map((field) => ({
                key: field,
                label: formatFieldLabel(field),
                value: resolveFieldValue(field, history),
                isDifferent: differentFieldsToRender.includes(field),
              }))}
            />
          </div>
        ))}
      </div>
    </HistoryValueListScroller>
  )

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

      {unavailable ? (
        <div className="form-container">
          <Text>
            {formatMessage({
              id: 'bPlaceHistoryUnavailable',
              defaultMessage: 'Geschichte ist nur online verfügbar.',
            })}
          </Text>
        </div>
      ) : (
        <div className={styles.containerWrap}>
          <div className={styles.container}>
            <section className={styles.panelLeft}>
              <h2 className={styles.panelTitle}>
                {formatMessage({
                  id: 'bPlaceCurrentVersion',
                  defaultMessage: 'Aktuelle Version',
                })}
              </h2>
              {resolvedLeftHistories.length > 0 ? (
                <div className={styles.rightContent}>
                  <div className={styles.sliderHeader}>
                    <Button icon={<TbChevronLeft />} disabled />
                    <Caption1>
                      {`${Math.min(1, resolvedLeftHistories.length)} / ${resolvedLeftHistories.length}`}
                    </Caption1>
                    <Button icon={<TbChevronRight />} disabled />
                  </div>
                  <div className={styles.sliderShell}>
                    {renderHistoryRows({
                      historiesToRender: resolvedLeftHistories,
                      selectedIndex: 0,
                      fields: resolvedLeftDisplayFields,
                      differentFieldsToRender: resolvedLeftDifferentFields,
                    })}
                  </div>
                </div>
              ) : (
                <div className={styles.leftContent}>{leftContent}</div>
              )}
            </section>

            <section className={styles.panelRight}>
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
                  {!loadingHistories &&
                    !historyError &&
                    histories.length === 0 && (
                      <div className={styles.empty}>
                        {formatMessage({
                          id: 'bPlaceNoHistory',
                          defaultMessage:
                            'Keine historischen Versionen gefunden.',
                        })}
                      </div>
                    )}
                  {!loadingHistories &&
                    !historyError &&
                    histories.length > 0 && (
                      renderHistoryRows({
                        historiesToRender: histories,
                        selectedIndex: selectedHistoryIndex,
                        fields: displayFields,
                        differentFieldsToRender: differentFields,
                      })
                    )}
                </div>
              </div>
              <div className={styles.footer}>
                <Button
                  onClick={onRestoreDiffValues}
                  disabled={!differentFields.length}
                >
                  {formatMessage({
                    id: 'bPlaceRestoreRedValues',
                    defaultMessage: 'Rote Werte wiederherstellen',
                  })}
                </Button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
