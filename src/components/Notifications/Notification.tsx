import { useEffect } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import {
  MdClose as CloseIcon,
  MdError as ErrorIcon,
  MdCheckCircle as SuccessIcon,
  MdWarning as WarningIcon,
} from 'react-icons/md'
import { useSetAtom } from 'jotai'

import { removeNotificationAtom } from '../../store.ts'
import styles from './Notification.module.css'

const colorMap = {
  error: '#D84315',
  success: '#00a300',
  info: '#4a148c',
  warning: 'orange',
}

export const Notification = ({ notification }) => {
  const {
    id,
    title,
    body,
    intent,
    timeout = 10000,
    paused,
    progress_percent,
  } = notification
  const removeNotification = useSetAtom(removeNotificationAtom)

  const onClickClose = () => removeNotification(id)

  useEffect(() => {
    let timeoutId
    if (progress_percent === 100 || paused === false) {
      timeoutId = setTimeout(() => removeNotification(id), 500)
      return () => clearTimeout(timeoutId)
    } else if (timeout && paused === null) {
      timeoutId = setTimeout(() => removeNotification(id), timeout)
    } else if (paused === true) {
      // do nothing - will do when notification is updated to paused === false
    }
    return () => timeoutId && clearTimeout(timeoutId)
  }, [id, paused, progress_percent, timeout, notification, removeNotification])

  // TODO: add progress bar
  // https://react.fluentui.dev/?path=/docs/components-progressbar--default
  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <div className={styles.iconAndTitle}>
          {paused === true ? (
            <Spinner size="small" />
          ) : (
            <>
              {intent === 'error' && <ErrorIcon color={colorMap[intent]} />}
              {intent === 'success' && <SuccessIcon color={colorMap[intent]} />}
              {intent === 'info' && <SuccessIcon color={colorMap[intent]} />}
              {intent === 'warning' && <WarningIcon color={colorMap[intent]} />}
            </>
          )}
          {!!title && <div className={styles.title}>{title}</div>}
        </div>
        <Button
          aria-label="Close"
          onClick={onClickClose}
          title="Close"
          size="small"
          icon={<CloseIcon />}
          appearance="subtle"
        />
      </div>
      <div className={styles.message}>{body}</div>
    </div>
  )
}
