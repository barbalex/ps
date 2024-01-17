import { ToNav } from './ToNav'

export const ToNavs = ({ tos }) => (
  <nav className="navs">
    {tos.map((to) => (
      <ToNav key={to.path} to={to} />
    ))}
  </nav>
)
