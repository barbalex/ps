import { memo } from 'react'
import { Link, useSearchParams } from 'react-router'

export const Nav = memo(({ label, to, ref }) => {
  const [searchParams] = useSearchParams()

  return (
    <Link to={{ pathname: to, search: searchParams.toString() }} ref={ref}>
      {label}
    </Link>
  )
})
