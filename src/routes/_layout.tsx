import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Header } from '../components/Layout/Header/index.tsx'

export const Route = createFileRoute('/_layout')({
  component: Component,
})

const homeOutletStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}

function Component() {
  return (
    <>
      <Header />
      <div style={homeOutletStyle}>
        <Outlet />
      </div>
    </>
  )
}
