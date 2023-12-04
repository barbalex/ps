import { useLocation, useParams, useMatches,  } from 'react-router-dom'

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
    <div className="path">
      <ol>
        {crumbs.map((crumb, index) => (
          <li key={index}>{crumb}</li>
        ))}
      </ol>
    </div>
  )
}
