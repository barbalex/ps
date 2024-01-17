import { Link } from 'react-router-dom'

export const Nav = ({ label, to }) => <Link to={to}>{label}</Link>
