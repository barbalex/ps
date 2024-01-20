import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

export const Nav = forwardRef(({ label, to }, ref) => (
  <Link to={to} ref={ref}>
    {label}
  </Link>
))
