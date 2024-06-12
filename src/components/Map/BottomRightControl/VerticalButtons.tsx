import { useRef, useEffect, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../../ElectricProvider.tsx'

const verticalbuttonsStyle = {
  gridArea: 'verticalbuttons',
  backgroundColor: 'white',
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

export const VerticalButtons = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const hideMapUi = appState?.map_hide_ui ?? false

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  if (hideMapUi) return null

  return (
    <div style={verticalbuttonsStyle} ref={ref}>
      vertical buttons
    </div>
  )
})
