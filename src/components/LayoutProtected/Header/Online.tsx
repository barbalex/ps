import { Button, Tooltip, CounterBadge } from '@fluentui/react-components'
import {
  useNavigate,
  useLocation,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import {
  MdCloudDone as NetworkOn,
  MdCloudOff as NetworkOff,
} from 'react-icons/md'
import styles from './Online.module.css'

import { onlineAtom, operationsQueueAtom } from '../../../store.ts'

export const Online = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const canGoBack = useCanGoBack()
  const { history } = useRouter()
  const online = useAtomValue(onlineAtom)
  const operationsQueue = useAtomValue(operationsQueueAtom)

  const title =
    online ? 'Sie sind online'
    : operationsQueue.length ?
      `Sie sind offline. ${operationsQueue.length} Operationen warten auf Synchronisation`
    : `Sie sind offline`

  const onClick = () => {
    pathname === '/data/queued-operations' ?
      canGoBack ? history.go(-1)
      : navigate({ to: '/data/' })
    : navigate({ to: '/data/queued-operations' })
  }

  return (
    <>
      <Tooltip content={title}>
        <Button
          size="medium"
          icon={
            <div className={styles.iconContainer}>
              {online ?
                <NetworkOn className={styles.icon} />
              : <NetworkOff className={styles.icon} />}
              <CounterBadge
                appearance="outline"
                size="extra-small"
                className={styles.badge}
              >
                {operationsQueue.length}
              </CounterBadge>
            </div>
          }
          onClick={onClick}
          className={styles.button}
        />
      </Tooltip>
    </>
  )
}
