import { useMatches, Link, useLocation } from 'react-router-dom'

export const Breadcrumbs = () => {
  const matches = useMatches()
  const location = useLocation()

  const crumbs = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements
    .map((match) => match.handle.crumb?.(match))

  // New Idea: active (last) crumb should _not_ be a link
  // Pass Objects with { text, link } to crumb
  // Add arrows between crumbs

  return (
    <nav className="breadcrumbs">
      {crumbs.map(({ text, url }, index) => (
        <div className="crumb-container" key={index}>
          {index > 0 ? <div className="crumb">&gt;</div> : ''}
          <div className="crumb">
            {location.pathname === url ? text : <Link to={url}>{text}</Link>}
          </div>
        </div>
      ))}
    </nav>
  )
}
