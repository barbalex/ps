import { useCallback, useState } from 'react'
import { useMatches, useNavigate } from 'react-router-dom'
import { BsCaretDown } from 'react-icons/bs'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import './breadcrumbs.css'
import { navs } from '../router'

export const Breadcrumbs = () => {
  const matches = useMatches()
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)
  const closeMenu = useCallback(() => setAnchorEl(null), [])

  const [myNavs, setMyNavs] = useState([])

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  // New Idea: active (last) crumb should _not_ be a link
  // Pass Objects with { text, link } to crumb
  // Add arrows between crumbs
  const onClick = useCallback(({ e, table, folder, match }) => {
    e.stopPropagation()
    console.log('clicked', { match, table, folder })
    setAnchorEl(e.currentTarget)
    if (table === 'home' || folder === false) {
      // TODO:
      switch (table) {
        case 'home':
          setMyNavs(navs({ path: '/', match }))
          break
        case 'projects':
          setMyNavs(navs({ path: 'project', match }))
          break
        default:
          setMyNavs([])
          break
      }
    } else {
      console.log('should fetch data for table', table)
    }
  }, [])

  return (
    <>
      <nav className="breadcrumbs">
        {filteredMatches.map((match, index) => {
          const { text, table, folder } = match?.handle?.crumb?.(match) ?? {}
          const className =
            location.pathname === match.pathname
              ? 'breadcrumbs__crumb is-active'
              : 'breadcrumbs__crumb link'

          return (
            <div
              className={className}
              key={index}
              onClick={() => navigate(match.pathname)}
            >
              {text}
              <IconButton
                onClick={(e) => onClick({ e, table, folder, match })}
                className="icon"
              >
                <BsCaretDown />
              </IconButton>
            </div>
          )
        })}
      </nav>{' '}
      <Menu
        id="breadcrumb-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={closeMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {myNavs.map(({ path, text }, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              navigate(path)
              setAnchorEl(null)
            }}
          >
            {text}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
