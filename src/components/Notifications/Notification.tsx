import { useEffect } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import {
  MdClose as CloseIcon,
  MdError as ErrorIcon,
  MdCheckCircle as SuccessIcon,
  MdWarning as WarningIcon,
} from 'react-icons/md'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { addOperationAtom } from '../../store.ts'

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  margin: '5px',
  padding: '10px',
  borderRadius: '3px',
  // color: 'white',
  backgroundColor: 'white',
  minHeight: '18px',
  maxWidth: 'calc(100% - 10px)',
  wordWrap: 'break-word',
  boxShadow:
    'rgba(0, 0, 0, 0.12) 0px 0px 2px 0px, rgba(0, 0, 0, 0.14) 0px 4px 8px 0px',
  minWidth: 200,
}
const titleRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
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
const iconAndTitleStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: 5,
}

const colorMap = {
  error: '#D84315',
  success: '#00a300',
  info: '#4a148c',
  warning: 'orange',
}

export const Notification = ({ notification }) => {
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()
  const {
    notification_id,
    title,
    body,
    intent,
    timeout = 10000,
    paused,
    progress_percent,
  } = notification

  const onClickClose = () => {
    db.query(`DELETE FROM notifications WHERE notification_id = $1`, [
      notification_id,
    ])
    addOperation({
      table: 'notifications',
      rowIdName: 'notification_id',
      rowId: notification_id,
      operation: 'delete',
      draft: null,
      prev: { ...notification },
    })
  }

  useEffect(() => {
    let timeoutId
    if (progress_percent === 100 || paused === false) {
      timeoutId = setTimeout(() => {
        db.query(`DELETE FROM notifications WHERE notification_id = $1`, [
          notification_id,
        ])
        addOperation({
          table: 'notifications',
          rowIdName: 'notification_id',
          rowId: notification_id,
          operation: 'delete',
          draft: null,
          prev: { ...notification },
        })
      }, 500)
      return () => clearTimeout(timeoutId)
    } else if (timeout && paused === null) {
      timeoutId = setTimeout(() => {
        db.query(`DELETE FROM notifications WHERE notification_id = $1`, [
          notification_id,
        ])
        addOperation({
          table: 'notifications',
          rowIdName: 'notification_id',
          rowId: notification_id,
          operation: 'delete',
          draft: null,
          prev: { ...notification },
        })
      }, timeout)
    } else if (paused === true) {
      // do nothing - will do when notification is updated to paused === false
    }
    return () => timeoutId && clearTimeout(timeoutId)
  }, [
    db,
    notification_id,
    paused,
    progress_percent,
    timeout,
    addOperation,
    notification,
  ])

  // TODO: add progress bar
  // https://react.fluentui.dev/?path=/docs/components-progressbar--default
  return (
    <div style={containerStyle}>
      <div style={titleRowStyle}>
        <div style={iconAndTitleStyle}>
          {paused === true ?
            <Spinner size="small" />
          : <>
              {intent === 'error' && <ErrorIcon color={colorMap[intent]} />}
              {intent === 'success' && <SuccessIcon color={colorMap[intent]} />}
              {intent === 'info' && <SuccessIcon color={colorMap[intent]} />}
              {intent === 'warning' && <WarningIcon color={colorMap[intent]} />}
            </>
          }
          {!!title && <div style={titleStyle}>{title}</div>}
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
      <div style={messageStyle}>{body}</div>
    </div>
  )
}
