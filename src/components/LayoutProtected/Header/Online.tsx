import * as fluentUiReactComponents from '@fluentui/react-components'
import type {
  CounterBadgeProps,
  TooltipProps,
} from '@fluentui/react-components'
import type { ComponentType } from 'react'
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
import { useIntl } from 'react-intl'
import styles from './Online.module.css'

import { onlineAtom, operationsQueueAtom } from '../../../store.ts'

const { Button } = fluentUiReactComponents

// Fluent UI's TooltipProps requires `relationship`, but it is optional at runtime
const Tooltip = fluentUiReactComponents.Tooltip as ComponentType<
  Omit<TooltipProps, 'relationship'> & {
    relationship?: TooltipProps['relationship']
  }
>

// CounterBadgeProps restricts `appearance` to 'filled' | 'ghost',
// but 'outline' is applied as a css class at runtime
const CounterBadge = fluentUiReactComponents.CounterBadge as ComponentType<
  Omit<CounterBadgeProps, 'appearance'> & { appearance?: string }
>

type Props = {
  // width is passed by the header menu to align this button with its
  // siblings, the value itself is not used
  width?: number
}

export const Online = (_props: Props) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const canGoBack = useCanGoBack()
  const { history } = useRouter()
  const online = useAtomValue(onlineAtom)
  const operationsQueue = useAtomValue(operationsQueueAtom)

  const title = online
    ? formatMessage({
        id: 'onlineStatusOnline',
        defaultMessage: 'Du bist online',
      })
    : operationsQueue.length
      ? formatMessage(
          {
            id: 'onlineStatusOfflineQueued',
            defaultMessage:
              'Du bist offline. {count} Operationen warten auf Synchronisation',
          },
          { count: operationsQueue.length },
        )
      : formatMessage({
          id: 'onlineStatusOffline',
          defaultMessage: 'Du bist offline',
        })

  const onClick = () => {
    pathname === '/data/queued-operations'
      ? canGoBack
        ? history.go(-1)
        : // type-only: '/data/' is not part of the generated route union
          // but resolves to the /data route at runtime
          navigate({ to: '/data/' as never })
      : navigate({ to: '/data/queued-operations' })
  }

  return (
    <>
      <Tooltip content={title}>
        <Button
          size="medium"
          appearance="transparent"
          icon={
            <div className={styles.iconContainer}>
              {online ? (
                <NetworkOn className={styles.icon} />
              ) : (
                <NetworkOff className={styles.icon} />
              )}
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
