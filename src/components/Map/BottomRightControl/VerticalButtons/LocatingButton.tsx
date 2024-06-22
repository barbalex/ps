import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { ToolbarToggleButton } from '@fluentui/react-components'
import { IoMdLocate } from 'react-icons/io'

import { useElectric } from '../../../../ElectricProvider.tsx'

export const LocatingButton = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapIsLocating = appState?.map_locate ?? false

  const onClickLocate = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: { map_locate: !mapIsLocating },
    })
  }, [appState?.app_state_id, db.app_states, mapIsLocating])

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
