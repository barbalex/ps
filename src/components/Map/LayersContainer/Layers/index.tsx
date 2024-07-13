import { memo } from 'react'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { ActiveLayers } from './Actives/index.tsx'
import { WmsLayers } from './WMS.tsx'
import { VectorLayers } from './Vector.tsx'
import { OwnLayers } from './Own.tsx'

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}

const formStyle = {
  // enable scrolling
  overflowY: 'auto',
  height: '100%',
}

export const Layers = memo(({ isNarrow }) => {
  return (
    <ErrorBoundary>
      <div
        style={{
          ...containerStyle,
          ...(isNarrow ? { marginTop: 5 } : { marginRight: 5 }),
        }}
      >
        <FormHeader
          title="Layers"
          titleMarginLeft={isNarrow ? 34 : undefined}
        />
        <div style={formStyle}>
          <ActiveLayers isNarrow={isNarrow} />
          <WmsLayers />
          <VectorLayers />
          <OwnLayers />
        </div>
      </div>
    </ErrorBoundary>
  )
})
