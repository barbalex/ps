import { useLocation, useParams, useMatches } from 'react-router-dom'

function isOdd(num) {
  return num % 2
}

export const Path = () => {
  const location = useLocation()
  const params = useParams()
  const matches = useMatches()
  console.log('Path', { location, params, matches })
  const crumbs = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => match.handle.crumb(match.data))

  return (
    <nav className="path">
      <ul>
        {crumbs.map((crumb, index) => (
          <>
            {isOdd(index) ? <li>&rArr;</li> : null}
            <li key={index}>{crumb}</li>
          </>
        ))}
      </ul>
    </nav>
  )
}
