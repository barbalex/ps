import { useCallback, useEvent } from 'react'
import { Button } from '@fluentui/react-components'
import { MdClose as CloseIcon } from 'react-icons/md'

import { useElectric } from '../../ElectricProvider'

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  margin: '5px',
  padding: '10px',
  borderRadius: '3px',
  backgroundColor: 'red',
  color: 'white',
  minHeight: '18px',
  maxWidth: 'calc(100% - 10px)',
  wordWrap: 'break-word',
}
const titleRowStyle = {
  display: 'flex',
}
const iconButtonStyle = {
  alignSelf: 'flex-start',
}
// http://hackingui.com/front-end/a-pure-css-solution-for-multiline-text-truncation/
const messageStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
}
const titleStyle = {
  fontWeight: 500,
  marginRight: '30px',
}

const colorMap = {
  error: '#D84315',
  success: '#00a300',
  info: '#4a148c',
  warning: 'orange',
}

export const Notification = ({ notification }) => {
  const { db } = useElectric()!
  const {
    notification_id,
    title,
    body,
    intent,
    timeout = 10000,
    paused,
    progress_percent,
  } = notification

  const onClickClose = useCallback(() => {
    db.notifications.delete({
      where: { notification_id },
    })
  }, [db.notifications, notification_id])

  useEvent(() => {
    let timeoutId
    if (progress_percent === 100 || paused === false) {
      timeoutId = setTimeout(() => {
        db.notifications.delete({
          where: { notification_id },
        })
      }, 500)
      return () => clearTimeout(timeoutId)
    } else if (timeout && paused === undefined) {
      timeoutId = setTimeout(() => {
        db.notifications.delete({
          where: { notification_id },
        })
      }, timeout)
    } else if (paused === true) {
      // do nothing - will do when notification is updated to paused === false
    }
    return () => timeoutId && clearTimeout(timeoutId)
  }, [])

  // TODO: add icon for intent
  // TODO: add progress bar
  // TODO: add spinner for paused
  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor: colorMap[intent] ?? 'error',
      }}
    >
      <div>
        <div style={titleRowStyle}>
          {!!title && <div style={titleStyle}>{`${title}:`}</div>}
        </div>
        <div style={messageStyle}>{body}</div>
      </div>
      <Button
        key="close"
        aria-label="Close"
        color="inherit"
        onClick={onClickClose}
        title="Close"
        size="small"
        style={{ iconButtonStyle }}
      >
        <CloseIcon />
      </Button>
    </div>
  )
}
