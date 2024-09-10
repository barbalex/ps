import { memo, useCallback } from 'react'
import { ToolbarToggleButton } from '@fluentui/react-components'
import { IoMdLocate } from 'react-icons/io'
import { useAtom } from 'jotai'

import { mapLocateAtom } from '../../../../store.ts'

export const LocatingButton = memo(() => {
  const [mapIsLocating, setMapIsLocating] = useAtom(mapLocateAtom)

  const onClickLocate = useCallback(
    () => setMapIsLocating(!mapIsLocating),
    [mapIsLocating, setMapIsLocating],
  )

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
})
