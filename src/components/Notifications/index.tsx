import { useCallback } from 'react'
import { Button } from '@fluentui/react-components'
import { MdClose as CloseIcon } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { Notifications as Notification } from '../../generated/client'

// z-index needs to cover map, thus so hight
const containerStyle = {
  padding: 5,
  zIndex: 500,
  position: 'absolute',
  bottom: 10,
  left: 10,
}
const buttonStyle = {
  marginLeft: '5px !important',
}

import Notification from './Notification'

const Notifications: React.FC = () => {
  const { db } = useElectric()!
  // get the oldest four notification first
  const { results } = useLiveQuery(
    db.notifications.liveMany({
      orderBy: { notification_id: 'desc' },
      take: 4,
    }),
  )
  const notifications: Notification[] = results

  const onClickClose = useCallback(() => {
    db.notifications.deleteMany()
  }, [db.notifications])

  const notifObject = notifications.toJSON()

  if (notifications.length === 0) return null

  return (
    <div style={containerStyle} key={Object.keys(notifObject)}>
      {notifications.map((n) => (
        <Notification key={n.id} notification={n} />
      ))}
      {notifications.length > 2 && (
        <Button
          key="close"
          aria-label="Close"
          color="secondary"
          onClick={onClickClose}
          title="Close all"
          size="small"
          edge="start"
          style={buttonStyle}
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  )
}

export default Notifications
