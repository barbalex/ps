import { Button } from '@fluentui/react-components'
import { MdClose as CloseIcon } from 'react-icons/md'
import { useSetAtom, useAtomValue } from 'jotai'

import { Notification as NotificationComponent } from './Notification.tsx'
import {
  notificationsAtom,
  removeNotificationAtom,
  // addNotificationAtom,
} from '../../store.ts'

// z-index needs to cover map, thus so hight
const containerStyle = {
  padding: 5,
  zIndex: 99999,
  position: 'absolute',
  bottom: 10,
  left: 10,
}
const buttonStyle = {
  marginLeft: 5,
}

export const Notifications: React.FC = () => {
  const notifications = useAtomValue(notificationsAtom)
  const removeNotification = useSetAtom(removeNotificationAtom)
  // const addNotification = useSetAtom(addNotificationAtom)

  // sort by time descending
  // get the first four
  const firstFourNotifications = notifications
    .sort((a, b) => b.time - a.time)
    .slice(0, 4)

  // console.log('Notifications', { firstFourNotifications, notifications })

  const onClickCloseAll = () => {
    for (const n of firstFourNotifications) {
      removeNotification(n.id)
    }
  }

  return (
    <>
      {firstFourNotifications.length > 0 && (
        <div style={containerStyle}>
          {firstFourNotifications.map((n) => (
            <NotificationComponent
              key={n.id}
              notification={n}
            />
          ))}
          {firstFourNotifications.length > 1 && (
            <Button
              aria-label="Close"
              color="secondary"
              onClick={onClickCloseAll}
              title="Close all"
              size="small"
              edge="start"
              style={buttonStyle}
              icon={<CloseIcon />}
            />
          )}
        </div>
      )}
      {/* <Button
        onClick={() =>
          addNotification({
            title: 'Test notification',
            intent: 'success',
            timeout: 2000,
          })
        }
        size="small"
      >
        Make a notification
      </Button> */}
    </>
  )
}
