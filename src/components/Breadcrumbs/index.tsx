import { useMatches } from 'react-router-dom'

import './breadcrumbs.css'
import { Breadcrumb } from './Breadcrumb'

export const Breadcrumbs = () => {
  const matches = useMatches()

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  return (
    <>
      <nav className="breadcrumbs">
        {filteredMatches.map((match, index) => (
          <Breadcrumb key={index}  match={match} />
        ))}
      </nav>
    </>
  )
}
