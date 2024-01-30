import React, { useContext, useCallback } from 'react'
import styled from '@emotion/styled'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { MdClose as CloseIcon } from 'react-icons/md'

import StoreContext from '../../storeContext'
import { IStore } from '../../store'

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin: 5px;
  padding: 10px;
  border-radius: 3px;
  background-color: ${(props) => props['data-color']};
  color: white;
  min-height: 18px;
  max-width: calc(100% - 10px);
  word-wrap: break-word;
`
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
const StyledIconButton = styled(IconButton)`
  align-self: flex-start;
`
const StyledButton = styled(Button)`
  color: white !important;
  border-color: white !important;
  margin-left: 10px;
  > span {
    text-transform: none;
  }
`
// http://hackingui.com/front-end/a-pure-css-solution-for-multiline-text-truncation/
const Message = styled.div`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`
const Title = styled.div`
  font-weight: 500;
  margin-right: 30px;
`

const colorMap = {
  error: '#D84315',
  success: '#00a300',
  info: '#4a148c',
  warning: 'orange',
}

export const Notification = ({ notification: n }) => {
  const store: IStore = useContext(StoreContext)
  const { removeNotificationById } = store
  const {
    title,
    message,
    actionLabel,
    actionName,
    actionArgument,
    revertTable,
    revertId,
    revertField,
    revertValue,
    revertValues,
    type,
  } = n

  const color = colorMap[type] ?? 'error'

  const onClickClose = useCallback(
    () => removeNotificationById(n.id),
    [n.id, removeNotificationById],
  )
  const onClickAction = useCallback(() => {
    store?.[actionName]?.(actionArgument ?? undefined)
    if (revertTable && revertId && revertField) {
      store.updateModelValue({
        table: revertTable,
        id: revertId,
        field: revertField,
        value: revertValue,
      })
    } else if (revertTable && revertId && revertValues) {
      store.updateModelValues({
        table: revertTable,
        id: revertId,
        values: JSON.parse(revertValues),
      })
    }
    removeNotificationById(n.id)
  }, [
    actionArgument,
    actionName,
    n.id,
    removeNotificationById,
    revertField,
    revertId,
    revertTable,
    revertValue,
    revertValues,
    store,
  ])

  return (
    <div
      style={{ ...containerStyle, backgroundColor: color }}
    >
      <div>
        {!!title && <Title>{`${title}:`}</Title>}
        <Message>{message}</Message>
      </div>
      {!!actionName && !!actionLabel && (
        <StyledButton onClick={onClickAction} variant="outlined">
          {actionLabel}
        </StyledButton>
      )}
      <StyledIconButton
        key="close"
        aria-label="Close"
        color="inherit"
        onClick={onClickClose}
        title="Diese Meldung schliessen"
        size="small"
      >
        <CloseIcon />
      </StyledIconButton>
    </div>
  )
}
