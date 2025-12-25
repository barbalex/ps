import { useRef, useEffect } from 'react'
import { Switch } from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { mapHideUiAtom } from '../../../store.ts'
import styles from './UiButton.module.css'
import './uiButton.css'

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
    <div className={styles.uiButton} ref={ref}>
      <Switch
        title={hideMapUi ? 'Show Map UI' : 'Hide Map UI'}
        checked={hideMapUi}
        onChange={onChange}
        className={styles.switch}
      />
    </div>
  )
}
