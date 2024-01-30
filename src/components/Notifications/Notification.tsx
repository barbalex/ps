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
const iconButtonStyle = {
  alignSelf: 'flex-start',
}
// const StyledButton = styled(Button)`
//   color: white !important;
//   border-color: white !important;
//   margin-left: 10px;
//   > span {
//     text-transform: none;
//   }
// `
const buttonStyle = {
  color: 'white !important',
  borderColor: 'white !important',
  marginLeft: '10px',
  textTransform: 'none',
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
    timeout,
    paused,
    progress_percent,
  } = notification

  const onClickClose = useCallback(() => {
    db.notifications.delete({
      where: { notification_id },
    })
  }, [db.notifications, notification_id])

  useEvent(() => {}, [])

  return (
    <div
      style={{ ...containerStyle, backgroundColor: colorMap[type] ?? 'error' }}
    >
      <div>
        {!!title && <div style={titleStyle}>{`${title}:`}</div>}
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
