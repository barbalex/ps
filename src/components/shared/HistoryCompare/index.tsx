import type { Dispatch, ReactNode, SetStateAction } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { TbArrowLeft, TbChevronLeft, TbChevronRight } from 'react-icons/tb'
import { useIntl } from 'react-intl'

import { Loading } from '../Loading.tsx'
import { stringifyHistoryValue } from './utils.ts'

import styles from './index.module.css'

const { Button, Caption1, Text } = fluentUiReactComponents

type HistoryCompareProps<THistory extends Record<string, unknown>> = {
  headerTitle: string
  backLabel: string
  onBack: () => void
  unavailable: boolean
  unavailableText: string
  leftTitle: string
  rightTitle: string
  leftContent: ReactNode
  histories: THistory[]
  selectedHistoryIndex: number
  setSelectedHistoryIndex: Dispatch<SetStateAction<number>>
  loadingHistories: boolean
  historyError: string | null
  displayFields: string[]
  differentFields: string[]
  formatFieldLabel: (field: string) => ReactNode
  formatFieldValue?: (field: string, history: THistory) => ReactNode
  onRestoreDiffValues: () => void
}

export function HistoryCompare<THistory extends Record<string, unknown>>({
  headerTitle,
  backLabel,
  onBack,
  unavailable,
  unavailableText,
  leftTitle,
  rightTitle,
  leftContent,
  histories,
  selectedHistoryIndex,
  setSelectedHistoryIndex,
  loadingHistories,
  historyError,
  displayFields,
  differentFields,
  formatFieldLabel,
  formatFieldValue,
  onRestoreDiffValues,
}: HistoryCompareProps<THistory>) {
  const { formatMessage } = useIntl()

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
          <h1>{headerTitle}</h1>
          <Button icon={<TbArrowLeft />} onClick={onBack} size="small">
            {backLabel}
          </Button>
        </div>
        <div className="form-container">
          <Text>{unavailableText}</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="form-outer-container">
      <div className="form-header">
        <h1>{headerTitle}</h1>
        <Button icon={<TbArrowLeft />} onClick={onBack} size="small">
          {backLabel}
        </Button>
      </div>

      <div className={styles.container}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>{leftTitle}</h2>
          <div className={styles.leftContent}>{leftContent}</div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>{rightTitle}</h2>
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
