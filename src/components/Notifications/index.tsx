import { Button } from '@fluentui/react-components'
import { MdClose as CloseIcon } from 'react-icons/md'
import { useSetAtom, useAtom } from 'jotai'
// import { uuidv7 } from '@kripod/uuidv7'

import { Notification as NotificationComponent } from './Notification.tsx'
import { notificationsAtom, removeNotificationAtom } from '../../store.ts'

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
  const [allNotifications] = useAtom(notificationsAtom)
  const removeNotification = useSetAtom(removeNotificationAtom)
  console.log('Notifications, allNotifications:', allNotifications)

  // sort by time descending
  // get the first four
  const notifications = allNotifications
    .sort((a, b) => b.time - a.time)
    .slice(0, 4)

  const onClickClose = () => {
    for (const n of notifications) {
      removeNotification(n.notification_id)
    }
  }

  return (
    <>
      {notifications.length > 0 && (
        <div style={containerStyle}>
          {notifications.map((n) => (
            <NotificationComponent
              key={n.notification_id}
              notification={n}
            />
          ))}
          {notifications.length > 1 && (
            <Button
              aria-label="Close"
              color="secondary"
              onClick={onClickClose}
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
        onClick={() => {
          db.query(
            `INSERT INTO notifications (notification_id, title, intent, timeout) VALUES ('${uuidv7()}', 'Test', 'success', 3000)`,
          )
        }}
        size="small"
      >
        Make a notification
      </Button> */}
    </>
  )
}
