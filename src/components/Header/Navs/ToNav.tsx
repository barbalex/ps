import { Link } from 'react-router-dom'

export const ToNav = ({ to }) => {
  const { path, text } = to

  return <Link to={path}>{text}</Link>
}
