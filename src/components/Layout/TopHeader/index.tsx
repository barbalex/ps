import { Menu } from './Menu'

const containerDivStyle = {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  padding: '5px 10px',
  backgroundColor: 'rgba(38, 82, 37, 0.9)',
  padding: '0 10px',
  color: 'white',
}
const h1Style = { fontSize: 'large' }

export const TopHeader = () => {
  return (
    <div style={containerDivStyle}>
      <h1 style={h1Style}>Promoting Species</h1>
      <Menu />
    </div>
  )
}
