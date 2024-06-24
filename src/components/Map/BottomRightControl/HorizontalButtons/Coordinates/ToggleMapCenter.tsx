import { memo, useCallback } from 'react'
import { ToggleButton } from '@fluentui/react-components'
import { MdCenterFocusWeak } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../../../../ElectricProvider.tsx'

export const ToggleMapCenter = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const showMapCenter = appState?.map_show_center ?? false

  const onClickShowMapCenter = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: { map_show_center: !showMapCenter },
    })
  }, [db.app_states, appState?.app_state_id, showMapCenter])

  return (
    <ToggleButton
      checked={showMapCenter}
      onClick={onClickShowMapCenter}
      icon={<MdCenterFocusWeak />}
      aria-label={showMapCenter ? 'Hide map center' : 'Show map center'}
      title={showMapCenter ? 'Hide map center' : 'Show map center'}
      size="small"
    />
  )
})
