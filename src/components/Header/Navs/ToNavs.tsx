import { Link } from 'react-router-dom'

export const ToNavs = ({ tos }) => (
  <nav className="navs">
    {tos.map(({ path, text }) => (
      <Link key={path} to={path}>
        {text}
      </Link>
    ))}
  </nav>
)
