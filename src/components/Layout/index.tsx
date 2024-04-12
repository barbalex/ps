import { Outlet } from 'react-router-dom'

import { Header } from './Header'
const homeOutletStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}

export const Layout = () => (
  <>
    <Header />
    <div style={homeOutletStyle}>
      <Outlet />
    </div>
  </>
)
