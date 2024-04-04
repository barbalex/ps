import { Menu } from './Menu'

const containerStyle = {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(38, 82, 37, 0.9)',
  padding: '0 10px',
  color: 'white',
}
const titleStyle = { fontSize: 'large', userSelect: 'none' }

export const Header = () => {
  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Promoting Species</h1>
      <Menu />
    </div>
  )
}
