import { useRef, useEffect, memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import {
  Toolbar,
  ToolbarToggleButton,
  ToolbarButton,
} from '@fluentui/react-components'
import { IoMdLocate } from 'react-icons/io'
import { FaMinus, FaPlus } from 'react-icons/fa'

import { useElectric } from '../../../ElectricProvider.tsx'

const verticalbuttonsStyle = {
  gridArea: 'verticalbuttons',
  // backgroundColor: 'white',
  margin: 0,
  cursor: 'auto',
  position: 'relative',
  pointerEvents: 'auto',
  userSelect: 'none',
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'column',
  justifyItems: 'center',
  justifyContent: 'center',
  alignItems: 'center',
}
const toolbarButtonStyle = {
  backgroundColor: 'white',
  border: '0.666667px solid rgb(209, 209, 209)',
}

export const VerticalButtons = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const hideMapUi = appState?.map_hide_ui ?? false

  const onClickLocate = useCallback(() => {
    console.log('locate')
  }, [])
  const onClickZoomIn = useCallback(() => {
    console.log('zoom in')
  }, [])
  const onClickZoomOut = useCallback(() => {
    console.log('zoom out')
  }, [])

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  if (hideMapUi) return null

  // TODO: add: zoom to project bounds
  // TODO: add locating
  return (
    <div style={verticalbuttonsStyle} ref={ref}>
      <Toolbar vertical aria-label="vertical toolbar">
        <ToolbarToggleButton
          name="locate"
          value="locate"
          onClick={onClickLocate}
          aria-label="locate"
          title="locate"
          icon={<IoMdLocate />}
          size="large"
        />
        <ToolbarButton
          name="zoom_in"
          onClick={onClickZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
          icon={<FaPlus />}
          size="large"
          style={toolbarButtonStyle}
        />
        <ToolbarButton
          name="zoom_out"
          onClick={onClickZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
          icon={<FaMinus />}
          size="large"
          style={toolbarButtonStyle}
        />
      </Toolbar>
    </div>
  )
})
