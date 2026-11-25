import * as fluentUiReactComponents from '@fluentui/react-components'
const { Tooltip, ToggleButton } = fluentUiReactComponents
import { MdCenterFocusWeak } from 'react-icons/md'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { mapShowCenterAtom } from '../../../../../store.ts'

export const ToggleMapCenter = () => {
  const [showMapCenter, setShowMapCenter] = useAtom(mapShowCenterAtom)

  const onClickShowMapCenter = () => setShowMapCenter(!showMapCenter)

  const { formatMessage } = useIntl()
  const title = showMapCenter
    ? formatMessage({ id: 'mapHideCenter', defaultMessage: 'Kartenmitte ausblenden' })
    : formatMessage({ id: 'mapShowCenter', defaultMessage: 'Kartenmitte anzeigen' })

  return (
    <Tooltip content={title} relationship="label">
      <ToggleButton
        checked={showMapCenter}
        onClick={onClickShowMapCenter}
        icon={<MdCenterFocusWeak />}
        size="small"
      />
    </Tooltip>
  )
}
