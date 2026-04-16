import { useParams } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'
import dayjs from 'dayjs'

import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { operationsQueueAtom } from '../../store.ts'
import { idFieldFromTable } from '../../modules/idFieldFromTable.ts'

import styles from './index.module.css'
import '../../form.css'

const from = '/data/queued-operations/$queuedOperationId'

export const QueuedOperation = () => {
  const { formatMessage } = useIntl()
  const { queuedOperationId } = useParams({ from })
  const operationsQueue = useAtomValue(operationsQueueAtom)

  const qo = operationsQueue.find((o) => o.id === queuedOperationId)

  if (!qo) {
    return <NotFound table="Queued Operation" id={queuedOperationId} />
  }

  const { time, table, operation, rowIdName, rowId, filter, draft, prev } = qo

  const displayId =
    rowId ??
    draft?.[rowIdName] ??
    prev?.[rowIdName] ??
    draft?.[idFieldFromTable(table)] ??
    prev?.[idFieldFromTable(table)]

  const prevWithOnlyDraftKeys: Record<string, unknown> = {}
  if (prev && draft) {
    Object.keys(draft).forEach((key) => {
      if (key in prev) prevWithOnlyDraftKeys[key] = prev[key]
    })
  }

  return (
    <div className="form-outer-container">
      <Header />
      <div className="form-container">
        <div className={styles.fields}>
          <span className={styles.label}>
            {formatMessage({ id: 'qoHeadingTime', defaultMessage: 'Zeit' })}
          </span>
          <span className={styles.value}>
            {dayjs(time).format('YYYY.MM.DD HH:mm:ss')}
          </span>

          <span className={styles.label}>
            {formatMessage({
              id: 'qoHeadingTable',
              defaultMessage: 'Tabelle',
            })}
          </span>
          <span className={styles.value}>{table}</span>

          <span className={styles.label}>
            {formatMessage({
              id: 'qoHeadingOperation',
              defaultMessage: 'Operation',
            })}
          </span>
          <span className={styles.value}>{operation}</span>

          {displayId && (
            <>
              <span className={styles.label}>
                {formatMessage({ id: 'qoHeadingId', defaultMessage: 'ID' })}
              </span>
              <span className={styles.value}>{displayId}</span>
            </>
          )}

          {filter && (
            <>
              <span className={styles.label}>
                {formatMessage({
                  id: 'qoHeadingFilter',
                  defaultMessage: 'Filter',
                })}
              </span>
              <pre className={styles.pre}>
                <code>{JSON.stringify(filter, null, 2)}</code>
              </pre>
            </>
          )}

          {prev && Object.keys(prevWithOnlyDraftKeys).length > 0 && (
            <>
              <span className={styles.label}>
                {formatMessage({
                  id: 'qoHeadingBefore',
                  defaultMessage: 'vorher',
                })}
              </span>
              <pre className={styles.pre}>
                <code>{JSON.stringify(prevWithOnlyDraftKeys, null, 2)}</code>
              </pre>
            </>
          )}

          {draft && (
            <>
              <span className={styles.label}>
                {formatMessage({
                  id: 'qoHeadingAfter',
                  defaultMessage: 'nachher',
                })}
              </span>
              <pre className={styles.pre}>
                <code>{JSON.stringify(draft, null, 2)}</code>
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
