import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToolbarToggleButton } = fluentUiReactComponents
import { MdMyLocation } from 'react-icons/md'
import { useAtom } from 'jotai'

import { mapLocateAtom } from '../../../../store.ts'

import styles from './index.module.css'

export const LocatingButton = () => {
  const [mapIsLocating, setMapIsLocating] = useAtom(mapLocateAtom)

  const onClickLocate = () => setMapIsLocating(!mapIsLocating)

  return (
    <ToolbarToggleButton
      name="locate"
      value={mapIsLocating as unknown as string}
      onClick={onClickLocate}
      aria-label={mapIsLocating ? 'Stop locating' : 'Locate'}
      title={mapIsLocating ? 'Stop locating' : 'Locate'}
      icon={<MdMyLocation />}
      size="large"
      className={styles.toolbarButton}
    />
  )
}
