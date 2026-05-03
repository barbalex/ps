import { FaTimes } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { IoMdInformationCircleOutline } from 'react-icons/io'
import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { ErrorBoundary } from '../../components/shared/ErrorBoundary.tsx'
import { QueuedOperation } from './QueuedOperation.tsx'
import { constants } from '../../modules/constants.ts'
import { operationsQueueAtom } from '../../store.ts'

import styles from './index.module.css'

export const QueuedOperations = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const { history } = useRouter()
  const operationsQueue = useAtomValue(operationsQueueAtom)

  const onClickCloseIcon = () =>
    canGoBack ? history.go(-1) : navigate({ to: '/data' })

  const openDocs = () => {
    const url = `${constants?.getAppUri()}/Dokumentation/offline`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }

  if (!operationsQueue.length) {
    return (
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{formatMessage({ id: 'qoPendingOpsTitle', defaultMessage: 'Ausstehende Operationen' })}</h3>
          <div>
            <Button
              aria-label={formatMessage({ id: 'qc.openDocs', defaultMessage: 'Dokumentation öffnen' })}
              title={formatMessage({ id: 'qc.openDocs', defaultMessage: 'Dokumentation öffnen' })}
              onClick={openDocs}
              icon={<IoMdInformationCircleOutline />}
            />
            <Button
              title={formatMessage({ id: 'qoCloseBtn', defaultMessage: 'schliessen' })}
              aria-label={formatMessage({ id: 'qoCloseBtn', defaultMessage: 'schliessen' })}
              onClick={onClickCloseIcon}
              className={styles.closeIcon}
              icon={<FaTimes />}
            />
          </div>
        </div>
        <div className={styles.noOpsContainer}>
          {formatMessage({ id: 'qoNoPendingOps', defaultMessage: 'Momentan gibt es keine ausstehenden Operationen' })}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{formatMessage({ id: 'qoPendingOpsTitle', defaultMessage: 'Ausstehende Operationen' })}</h3>
          <div>
            <Button
              title={formatMessage({ id: 'qoOpenGuideBtn', defaultMessage: 'Anleitung öffnen' })}
              aria-label={formatMessage({ id: 'qoOpenGuideBtn', defaultMessage: 'Anleitung öffnen' })}
              onClick={openDocs}
              icon={<IoMdInformationCircleOutline />}
            />
            <Button
              title={formatMessage({ id: 'qoCloseBtn', defaultMessage: 'schliessen' })}
              aria-label={formatMessage({ id: 'qoCloseBtn', defaultMessage: 'schliessen' })}
              onClick={onClickCloseIcon}
              icon={<FaTimes />}
            />
          </div>
        </div>
        <div className={styles.gridContainer}>
          <div className={styles.grid}>
            <div className={styles.heading}>{formatMessage({ id: 'qoHeadingTime', defaultMessage: 'Zeit' })}</div>
            <div className={styles.heading}>{formatMessage({ id: 'qoHeadingTable', defaultMessage: 'Tabelle' })}</div>
            <div className={styles.heading}>{formatMessage({ id: 'qoHeadingId', defaultMessage: 'ID' })}</div>
            <div className={styles.heading}>{formatMessage({ id: 'qoHeadingFilter', defaultMessage: 'Filter' })}</div>
            <div className={styles.heading}>{formatMessage({ id: 'qoHeadingOperation', defaultMessage: 'Operation' })}</div>
            <div className={styles.heading}>{formatMessage({ id: 'qoHeadingBefore', defaultMessage: 'vorher' })}</div>
            <div className={styles.heading}>{formatMessage({ id: 'qoHeadingAfter', defaultMessage: 'nachher' })}</div>
            <div className={styles.heading}>{formatMessage({ id: 'qoRevertBtn', defaultMessage: 'widerrufen' })}</div>
            {[...operationsQueue].reverse().map((qo, i) => (
              <QueuedOperation
                key={qo.id}
                qo={qo}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
