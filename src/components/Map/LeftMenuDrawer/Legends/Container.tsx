import { memo } from 'react'

import {
  Vector_layers as VectorLayer,
  Wms_layers as WmsLayer,
} from '../../../../generated/client/index.ts'

const containerStyle = {
  padding: 10,
}
const titleStyle = {
  fontWeight: 'bold',
  paddingBottom: 5,
}

type Props = {
  children: React.ReactNode
  layer: WmsLayer | VectorLayer
  isLast: boolean
}

export const Container = memo(({ children, layer, isLast }: Props) => (
  <section
    style={{
      ...containerStyle,
      borderTop: '1px solid rgba(55, 118, 28, 0.5)',
      ...(isLast ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' } : {}),
    }}
  >
    <div style={titleStyle}>{layer.label}</div>
    {children}
  </section>
))
