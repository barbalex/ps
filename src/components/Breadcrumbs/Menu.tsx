import { useNavigate } from 'react-router-dom'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

export const MenuComponent = ({ anchorEl, openMenu, closeMenu, navs }) => {
  const navigate = useNavigate()

  return (
    <Menu
      id="breadcrumb-menu"
      anchorEl={anchorEl}
      open={openMenu}
      onClose={closeMenu}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {navs.map(({ path, text }, index) => (
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
  )
}
