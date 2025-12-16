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

  return (
    <div className={styles.container}>
      <Tooltip content={title}>
        <Button
          size="medium"
          icon={online ? <NetworkOn /> : <NetworkOff />}
          onClick={() => console.log('Online status clicked')}
          className={styles.button}
        >
          <CounterBadge
            appearance="outline"
            size="extra-small"
            className={styles.badge}
          >
            10
          </CounterBadge>
        </Button>
      </Tooltip>
    </div>
  )
}
