import { FaTimes } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'

import { ErrorBoundary } from '../../components/shared/ErrorBoundary.tsx'
import { QueuedOperation } from './QueuedOperation.tsx'
import { constants } from '../../modules/constants.ts'
import { operationsQueueAtom } from '../../store.ts'

import styles from './index.module.css'

export const QueuedOperations = () => {
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
          <h3 className={styles.title}>Ausstehende Operationen</h3>
          <div>
            <Button
              aria-label={`Dokumentation zu "offline arbeiten" lesen`}
              title={`Dokumentation zu "offline arbeiten" lesen`}
              onClick={openDocs}
              icon={<IoMdInformationCircleOutline />}
            />
            <Button
              title="schliessen"
              aria-label="schliessen"
              onClick={onClickCloseIcon}
              className={styles.closeIcon}
              icon={<FaTimes />}
            />
          </div>
        </div>
        <div className={styles.noOpsContainer}>
          Es gibt momentan keine pendenten Operationen
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Ausstehende Operationen</h3>
          <div>
            <Button
              title="Anleitung öffnen"
              aria-label="Anleitung öffnen"
              onClick={openDocs}
              icon={<IoMdInformationCircleOutline />}
            />
            <Button
              title="schliessen"
              aria-label="schliessen"
              onClick={onClickCloseIcon}
              icon={<FaTimes />}
            />
          </div>
        </div>
        <div className={styles.gridContainer}>
          <div className={styles.heading}>Zeit</div>
          <div className={styles.heading}>Tabelle</div>
          <div className={styles.heading}>ID</div>
          <div className={styles.heading}>Filter</div>
          <div className={styles.heading}>Operation</div>
          <div className={styles.heading}>vorher</div>
          <div className={styles.heading}>nachher</div>
          <div className={styles.heading}>widerrufen</div>
          {[...operationsQueue].reverse().map((qo, i) => (
            <QueuedOperation
              key={qo.id}
              qo={qo}
              index={i}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  )
}
