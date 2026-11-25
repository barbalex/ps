import { useRef, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Tooltip, Switch } = fluentUiReactComponents
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as L from 'leaflet'

import { mapHideUiAtom } from '../../../store.ts'
import styles from './UiButton.module.css'
import './uiButton.css'

export const UiButton = () => {
  const [hideMapUi, setHideMapUi] = useAtom(mapHideUiAtom)
  const { formatMessage } = useIntl()
  const label = hideMapUi
    ? formatMessage({ id: 'mapShowControls', defaultMessage: 'Kartenwerkzeuge einblenden' })
    : formatMessage({ id: 'mapHideControls', defaultMessage: 'Kartenwerkzeuge ausblenden' })

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current!)
    L.DomEvent.disableScrollPropagation(ref.current!)
  }, [])

  const onChange = () => setHideMapUi(!hideMapUi)

  return (
    <div className={styles.uiButton} ref={ref}>
      <Tooltip content={label} relationship="label">
        <Switch
          checked={hideMapUi}
          onChange={onChange}
          className={styles.switch}
        />
      </Tooltip>
    </div>
  )
}
