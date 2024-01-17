import { Nav } from './Nav'

export const ToNavs = ({ tos }) => (
  <nav className="navs">
    {tos.map((to) => (
      <Nav key={to.path} to={to.path} label={to.text} />
    ))}
  </nav>
)
