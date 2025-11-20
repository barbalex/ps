import { ToolbarToggleButton } from '@fluentui/react-components'
import { IoMdLocate } from 'react-icons/io'
import { useAtom } from 'jotai'

import { mapLocateAtom } from '../../../../store.ts'

export const LocatingButton = () => {
  const [mapIsLocating, setMapIsLocating] = useAtom(mapLocateAtom)

  const onClickLocate = () => setMapIsLocating(!mapIsLocating)

  return (
    <ToolbarToggleButton
      name="locate"
      value={mapIsLocating}
      onClick={onClickLocate}
      aria-label={mapIsLocating ? 'Stop locating' : 'Locate'}
      title={mapIsLocating ? 'Stop locating' : 'Locate'}
      icon={<IoMdLocate />}
      size="large"
    />
  )
}
