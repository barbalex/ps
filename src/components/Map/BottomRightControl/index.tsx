import { memo } from 'react'

import { UiButton } from './UiButton.tsx'
import { VerticalButtons } from './VerticalButtons.tsx'
import { HorizontalButtons } from './HorizontalButtons.tsx'

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

export const BottomRightControl = memo(() => (
  <div style={containerStyle}>
    <VerticalButtons />
    <HorizontalButtons />
    <UiButton />
  </div>
))
