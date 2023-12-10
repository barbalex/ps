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
  const onClick = useCallback(({ e, path, match }) => {
    e.stopPropagation()
    const pathArray = path.split('/')
    console.log('clicked path:', { path, match, pathArray })
  }, [])

  return (
    <nav className="breadcrumbs">
      {filteredMatches.map((match, index) => {
        const { text, path } = match?.handle?.crumb?.(match) ?? {}
        const className =
          location.pathname === path
            ? 'breadcrumbs__crumb is-active'
            : 'breadcrumbs__crumb link'

        return (
          <div className={className} key={index} onClick={() => navigate(path)}>
            {text}
            <IconButton
              onClick={(e) => onClick({ e, path, match })}
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
