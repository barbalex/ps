import { forwardRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export const Nav = forwardRef(({ label, to }, ref) => {
  const [searchParams] = useSearchParams()

  return (
    <Link to={{ pathname: to, search: searchParams.toString() }} ref={ref}>
      {label}
    </Link>
  )
})
