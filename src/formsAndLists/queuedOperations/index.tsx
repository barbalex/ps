import { FaTimes } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'

import { ErrorBoundary } from '../../components/shared/ErrorBoundary.tsx'
import { QueuedOperation } from './QueuedOperation.tsx'
import { constants } from '../../modules/constants.ts'
import { operationsQueueAtom } from '../../store.ts'

import {
  titleRow,
  title,
  noOpsContainer,
  container,
  outerContainer,
  queriesContainer,
  heading,
  revertHeading,
  closeIcon,
} from './index.module.css'

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
      <div className={container}>
        <div className={titleRow}>
          <h3 className={title}>Ausstehende Operationen</h3>
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
              className={closeIcon}
              icon={<FaTimes />}
            />
          </div>
        </div>
        <div className={noOpsContainer}>
          Es gibt momentan keine pendenten Operationen
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={container}>
        <div className={titleRow}>
          <h3 className={title}>Ausstehende Operationen</h3>
          <div>
            <Button
              aria-label="Anleitung öffnen"
              title="Anleitung öffnen"
              onClick={openDocs}
              size="large"
              icon={<IoMdInformationCircleOutline />}
            />
            <Button
              title="schliessen"
              aria-label="schliessen"
              onClick={onClickCloseIcon}
              className={closeIcon}
              icon={<FaTimes />}
            />
          </div>
        </div>
        <div className={outerContainer}>
          <div className={queriesContainer}>
            <div className={heading}>Zeit</div>
            <div className={heading}>Tabelle</div>
            <div className={heading}>ID</div>
            <div className={heading}>Filter</div>
            <div className={heading}>Operation</div>
            <div className={heading}>vorher</div>
            <div className={heading}>nachher</div>
            <div className={revertHeading}>widerrufen</div>
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
