import { useRef, useEffect, useCallback, memo } from 'react'
import { Switch } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../../ElectricProvider.tsx'
import './uiButton.css'

const uibuttonStyle = {
  gridArea: 'uibutton',
  zIndex: 1000,
  margin: 0,
  cursor: 'auto',
  position: 'relative',
  pointerEvents: 'auto',
  userSelect: 'none',
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}
const switchStyle = {
  width: 40,
  height: 40,
  backgroundColor: 'white',
  border: '0.666667px solid rgb(209, 209, 209)',
  borderRadius: 4,
}

export const UiButton = memo(() => {
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

  const onChange = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: { map_hide_ui: !hideMapUi },
    })
  }, [db.app_states, appState?.app_state_id, hideMapUi])

  return (
    <div style={uibuttonStyle} ref={ref}>
      <Switch
        title={hideMapUi ? 'Show Map UI' : 'Hide Map UI'}
        checked={hideMapUi}
        onChange={onChange}
        style={switchStyle}
      />
    </div>
  )
})
