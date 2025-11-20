import { ToggleButton } from '@fluentui/react-components'
import { MdCenterFocusWeak } from 'react-icons/md'
import { useAtom } from 'jotai'

import { mapShowCenterAtom } from '../../../../../store.ts'

export const ToggleMapCenter = () => {
  const [showMapCenter, setShowMapCenter] = useAtom(mapShowCenterAtom)

  const onClickShowMapCenter = () => setShowMapCenter(!showMapCenter)

  const title = showMapCenter ? 'Hide map center' : 'Show map center'

  return (
    <ToggleButton
      checked={showMapCenter}
      onClick={onClickShowMapCenter}
      icon={<MdCenterFocusWeak />}
      aria-label={title}
      title={title}
      size="small"
    />
  )
}
