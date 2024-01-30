import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import {
  useId,
  Link,
  Button,
  Toaster,
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
  ToastTrigger,
} from '@fluentui/react-components'
import { uuidv7 } from '@kripod/uuidv7'

import { useElectric } from '../../ElectricProvider'
import { Ui_options as UiOption } from '../../generated/client'
import { user_id } from '../SqlInitializer'

type Notification = {
  title: string
  body: string
  intent?: 'success' | 'error' | 'warning' | 'info'
  subtitle?: string
  timeout?: number
  // id and pause are used to keep notifications live until a process is finished
  toastId?: string
  pause?: boolean
}

export const Notifier = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const notifications: Notification[] = useMemo(
    () => uiOption?.notifications ?? [],
    [uiOption?.notifications],
  )

  const toastId = useId(uuidv7())

  const toasterId = useId('toaster')
  const { dispatchToast, pauseToast, playToast } = useToastController(toasterId)
  useEffect(() => {
    if (!notifications.length) return
    notifications.forEach((notification) => {
      if (notification.pause === false && notification.toastId) {
        console.log('hello playing toast:', notification.toastId)
        return playToast(notification.toastId)
      }

      console.log('hello dispatching toast:', notification.toastId)
      dispatchToast(
        <Toast>
          <ToastTitle
            action={
              <ToastTrigger>
                <Link>Dismiss</Link>
              </ToastTrigger>
            }
          >
            {notification.title}
          </ToastTitle>
          <ToastBody subtitle={notification.subtitle}>
            {notification.body}
          </ToastBody>
        </Toast>,
        {
          intent: notification.intent ?? 'success',
          toastId: notification.toastId,
        },
      )
      if (notification.pause === true && notification.toastId) {
        console.log('hello pausing toast:', notification.toastId)
        pauseToast(notification.toastId)
      }
    })
    db.ui_options.update({ where: { user_id }, data: { notifications: [] } })
  }, [db.ui_options, dispatchToast, notifications, pauseToast, playToast])

  return (
    <>
      <Toaster
        toasterId={toasterId}
        // pauseOnHover
        // pauseOnWindowBlur
        // timeout={5000}
      />
      <Button
        onClick={() => {
          db.ui_options.update({
            where: { user_id },
            data: {
              notifications: [
                {
                  title: 'Title',
                  body: 'Body',
                  intent: 'warning', // 'success' | 'error' | 'warning' | 'info'
                  subtitle: 'Subtitle',
                  // timeout: 5000,
                  toastId,
                  pause: true,
                },
                ...notifications,
              ],
            },
          })
        }}
      >
        Make toast
      </Button>
    </>
  )
}
