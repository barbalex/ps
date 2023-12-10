import { useCallback } from 'react'
import { useMatches, useNavigate } from 'react-router-dom'
import { BsCaretDown } from 'react-icons/bs'
import IconButton from '@mui/material/IconButton'

import './breadcrumbs.css'

export const Breadcrumbs = () => {
  const matches = useMatches()
  const navigate = useNavigate()

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  // New Idea: active (last) crumb should _not_ be a link
  // Pass Objects with { text, link } to crumb
  // Add arrows between crumbs
  const onClick = useCallback(({ e, url, match }) => {
    e.stopPropagation()
    console.log('clicked url:', { url, match })
  }, [])

  return (
    <nav className="breadcrumbs">
      {filteredMatches.map((match, index) => {
        const { text, url } = match?.handle?.crumb?.(match) ?? {}
        const className =
          location.pathname === url
            ? 'breadcrumbs__crumb is-active'
            : 'breadcrumbs__crumb link'

        return (
          <div className={className} key={index} onClick={() => navigate(url)}>
            {text}
            <IconButton
              onClick={(e) => onClick({ e, url, match })}
              className="icon"
            >
              <BsCaretDown />
            </IconButton>
          </div>
        )
      })}
    </nav>
  )
}
