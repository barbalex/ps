import * as fluentUiReactComponents from '@fluentui/react-components'
const { Tooltip, ToolbarToggleButton } = fluentUiReactComponents
import { MdMyLocation } from 'react-icons/md'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { mapLocateAtom } from '../../../../store.ts'

import styles from './index.module.css'

export const LocatingButton = () => {
  const [mapIsLocating, setMapIsLocating] = useAtom(mapLocateAtom)
  const { formatMessage } = useIntl()
  const label = mapIsLocating
    ? formatMessage({ id: 'mapStopLocating', defaultMessage: 'Ortung beenden' })
    : formatMessage({ id: 'mapLocate', defaultMessage: 'Eigenen Standort anzeigen' })

  const onClickLocate = () => setMapIsLocating(!mapIsLocating)

  return (
    <Tooltip content={label} relationship="label">
      <ToolbarToggleButton
        name="locate"
        value={mapIsLocating as unknown as string}
        onClick={onClickLocate}
        icon={<MdMyLocation />}
        size="large"
        className={styles.toolbarButton}
      />
    </Tooltip>
  )
}
