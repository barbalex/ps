import { useMatches } from 'react-router-dom'

function isOdd(num) {
  return num % 2
}

export const Breadcrumbs = () => {
  const matches = useMatches()
  // console.log('Breadcrumbs, matches:', matches)
  const crumbs = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => match.handle.crumb(match.data))

  return (
    <nav className="breadcrumbs">
      {crumbs.map((crumb, index) => (
        <div className="crumb" key={index}>
          {isOdd(index) ? <span>&rArr;</span> : null}
          <span>{crumb}</span>
        </div>
      ))}
    </nav>
  )
}
