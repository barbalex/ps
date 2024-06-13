import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { UiButton } from './UiButton.tsx'
import { VerticalButtons } from './VerticalButtons/index.tsx'
import { HorizontalButtons } from './HorizontalButtons.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'

const containerStyle = {
  position: 'absolute',
  right: 10,
  bottom: 10,
  display: 'grid',
  gridTemplateColumns: '1fr 40px',
  gridTemplateRows: '1fr 40px',
  gridTemplateAreas: `
    '. verticalbuttons'
    'horizontalbuttons uibutton'
  `,
  gap: 5,
  justifyItems: 'stretch',
  alignItems: 'stretch',
}

export const BottomRightControl = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const hideMapUi = appState?.map_hide_ui ?? false

  return (
    <div style={containerStyle}>
      {!hideMapUi && (
        <>
          <VerticalButtons />
          <HorizontalButtons />
        </>
      )}
      <UiButton />
    </div>
  )
})
