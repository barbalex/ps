import { ToNav } from './ToNav'

export const ToNavs = ({ tos }) => (
  <nav className="navs">
    {tos.map((to, index) => (
      <ToNav key={`${tos.path}/${index}`} to={to} />
    ))}
  </nav>
)
