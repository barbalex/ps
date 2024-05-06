import { LegendsControl } from './LegendsControl/index.tsx'

const containerStyle = {
  // float children right
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}

export const OwnControls = () => {
  return (
    <div style={containerStyle}>
      <LegendsControl />
    </div>
  )
}
