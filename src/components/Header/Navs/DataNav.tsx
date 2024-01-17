import { Link } from 'react-router-dom'

export const DataNav = ({ label, to }) => <Link to={to}>{label}</Link>
