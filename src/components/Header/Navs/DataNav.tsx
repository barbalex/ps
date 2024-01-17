import { Link } from 'react-router-dom'

export const DataNav = ({ value, pathname }) => {
  const label = result.label ?? value

  return <Link to={`${pathname}/${value}`}>{label}</Link>
}
