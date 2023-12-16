import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'

export const MenuComponent = ({ anchorEl, setAnchorEl, closeMenu, navs }) => {
  const navigate = useNavigate()
  const [selectedKeys, setSelectedKeys] = useState([])

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e)
    setSelectedKeys([e.key])
    navigate(e.path)
    setAnchorEl(null)
  }

  const items: MenuProps['items'] = navs.map(({ path, text }, index) => ({
    label: text,
    path,
    key: index,
  }))

  return (
    <Menu
      onClick={onClick}
      selectedKeys={selectedKeys}
      mode="vertical"
      items={items}
    />
  )

  // return (
  //   <Menu
  //     id="breadcrumb-menu"
  //     anchorEl={anchorEl}
  //     open={openMenu}
  //     onClose={closeMenu}
  //     MenuListProps={{
  //       'aria-labelledby': 'basic-button',
  //     }}
  //   >
  //     {navs.map(({ path, text }, index) => (
  //       <MenuItem
  //         key={index}
  //         onClick={() => {
  //           navigate(path)
  //           setAnchorEl(null)
  //         }}
  //       >
  //         {text}
  //       </MenuItem>
  //     ))}
  //   </Menu>
  // )
}
