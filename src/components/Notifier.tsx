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
  ToastFooter,
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
  const notifications = uiOption?.notifications ?? []

  const toasterId = useId('toaster')
  const { dispatchToast } = useToastController(toasterId)
  const notify = () =>
    dispatchToast(
      <Toast>
        <ToastTitle action={<Link>Undo</Link>}>Email sent</ToastTitle>
        <ToastBody subtitle="Subtitle">This is a toast body</ToastBody>
        <ToastFooter>
          <Link>Action</Link>
          <Link>Action</Link>
        </ToastFooter>
      </Toast>,
      { intent: 'success' },
    )

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Button onClick={notify}>Make toast</Button>
    </>
  )
}
