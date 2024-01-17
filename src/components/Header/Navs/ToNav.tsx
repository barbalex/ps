import { Link } from 'react-router-dom'

export const ToNav = ({ to }) => <Link to={to.path}>{to.text}</Link>
