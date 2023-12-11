import { useCallback, useState } from 'react'
import { useMatches, useNavigate } from 'react-router-dom'
import { BsCaretDown } from 'react-icons/bs'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import './breadcrumbs.css'
import { navs } from '../../router'

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
          setMyNavs(navs({ path: 'project_id', match }))
          break
        case 'subprojects':
          setMyNavs(navs({ path: 'subproject_id', match }))
          break
        case 'places':
          setMyNavs(navs({ path: 'place_id', match }))
          break
        case 'checks':
          setMyNavs(navs({ path: 'check_id', match }))
          break
        case 'actions':
          setMyNavs(navs({ path: 'action_id', match }))
          break
        case 'action_reports':
          setMyNavs(navs({ path: 'action_report_id', match }))
          break
        case 'place_reports':
          setMyNavs(navs({ path: 'place_report_id', match }))
          break
        case 'goals':
          setMyNavs(navs({ path: 'goal_id', match }))
          break
        case 'goal_reports':
          setMyNavs(navs({ path: 'goal_report_id', match }))
          break
        case 'lists':
          setMyNavs(navs({ path: 'list_id', match }))
          break
        case 'taxonomies':
          setMyNavs(navs({ path: 'taxonomy_id', match }))
          break
        case 'observation_sources':
          setMyNavs(navs({ path: 'observation_source_id', match }))
          break
        default:
          setMyNavs([])
          break
      }
    } else {
      console.log('should fetch data for table', table)
    }
  }, [])

  console.log('Breadcrumbs, myNavs', myNavs)

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
              {myNavs?.length > 0 && (
                <IconButton
                  onClick={(e) => onClick({ e, table, folder, match })}
                  className="icon"
                >
                  <BsCaretDown />
                </IconButton>
              )}
            </div>
          )
        })}
      </nav>{' '}
      {myNavs?.length > 0 && (
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
      )}
    </>
  )
}
