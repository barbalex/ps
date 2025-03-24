import { memo } from 'react'
import { Link } from '@tanstack/react-router'

export const Nav = memo(({ label, to, ref }) => {
  return (
    <Link
      to={to}
      ref={ref}
    >
      {label}
    </Link>
  )
})
