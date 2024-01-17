import { Link } from 'react-router-dom'

export const DataNav = ({ label, value, pathname }) => (
  <Link to={`${pathname}/${value}`}>{label}</Link>
)
