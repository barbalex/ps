import { memo } from 'react'
import { Link } from 'react-router'

export const Nav = memo(({ label, to, ref }) => {
  return (
    <Link
      to={{ pathname: to }}
      ref={ref}
    >
      {label}
    </Link>
  )
})
