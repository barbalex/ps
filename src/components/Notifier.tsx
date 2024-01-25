import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import {
  useId,
  Link,
  // Button,
  Toaster,
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
  ToastTrigger,
} from '@fluentui/react-components'

import { useElectric } from '../ElectricProvider'
import { Ui_options as UiOption } from '../generated/client'
import { user_id } from './SqlInitializer'

export const Notifier = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const notifications = useMemo(
    () => uiOption?.notifications ?? [],
    [uiOption?.notifications],
  )

  const toasterId = useId('toaster')
  const { dispatchToast } = useToastController(toasterId)
  useEffect(() => {
    if (!notifications.length) return
    notifications.forEach((notification) => {
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
        { intent: notification.intent ?? 'success' },
      )
    })
    db.ui_options.update({ where: { user_id }, data: { notifications: [] } })
  }, [db.ui_options, dispatchToast, notifications])

  console.log('Notifier, notifications:', notifications)

  return (
    <>
      <Toaster
        toasterId={toasterId}
        pauseOnHover
        pauseOnWindowBlur
        timeout={5000}
      />
      {/* <Button
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
                  timeout: 10000,
                },
                ...notifications,
              ],
            },
          })
        }}
      >
        Make toast
      </Button> */}
    </>
  )
}
