import { useRef, useEffect } from 'react'
import { Switch } from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { mapHideUiAtom } from '../../../store.ts'
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

export const UiButton = () => {
  const [hideMapUi, setHideMapUi] = useAtom(mapHideUiAtom)

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  const onChange = () => setHideMapUi(!hideMapUi)

  return (
    <div
      style={uibuttonStyle}
      ref={ref}
    >
      <Switch
        title={hideMapUi ? 'Show Map UI' : 'Hide Map UI'}
        checked={hideMapUi}
        onChange={onChange}
        style={switchStyle}
      />
    </div>
  )
}
