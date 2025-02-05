import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-components'
import { MdClose as CloseIcon } from 'react-icons/md'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { usePGlite } from '@electric-sql/pglite-react'
// import { uuidv7 } from '@kripod/uuidv7'

import { Notification as NotificationComponent } from './Notification.tsx'

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

export const Notifications: React.FC = memo(() => {
  const db = usePGlite()
  // get the oldest four notification first
  const { results: notifications = [] } = useLiveQuery(
    db.notifications.liveMany({
      orderBy: { notification_id: 'desc' },
      take: 4,
    }),
  )

  const onClickClose = useCallback(() => {
    db.notifications.deleteMany()
  }, [db.notifications])

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
          db.notifications.create({
            data: {
              notification_id: uuidv7(),
              title: 'Test',
              // body: 'Test body',
              intent: 'success',
              timeout: 3000,
            },
          })
        }}
        size="small"
      >
        Make a notification
      </Button> */}
    </>
  )
})
