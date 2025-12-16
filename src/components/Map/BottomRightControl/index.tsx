import { useAtomValue } from 'jotai'

import { UiButton } from './UiButton.tsx'
import { VerticalButtons } from './VerticalButtons/index.tsx'
import { HorizontalButtons } from './HorizontalButtons/index.tsx'
import { mapHideUiAtom } from '../../../store.ts'

const containerStyle = {
  position: 'absolute',
  right: 5,
  bottom: 20,
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

export const BottomRightControl = () => {
  const hideMapUi = useAtomValue(mapHideUiAtom)

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
}
