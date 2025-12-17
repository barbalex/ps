import { Button, Tooltip, CounterBadge } from '@fluentui/react-components'
import { useNavigate, useLocation } from '@tanstack/react-router'
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
  const online = useAtomValue(onlineAtom)
  const operationsQueue = useAtomValue(operationsQueueAtom)

  const title =
    online ? 'Sie sind online'
    : operationsQueue.length ?
      `Sie sind offline. ${operationsQueue.length} wartende Operationen`
    : `Sie sind offline`

  const onClick = () => {
    console.log('Online.onClick', { pathname })
    if (pathname === '/data/queued-operations') {
      navigate(-1)
    } else {
      navigate({ to: '/data/queued-operations' })
    }
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
                10
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
