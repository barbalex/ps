import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import { BsCaretDown } from 'react-icons/bs'

export const MenuComponent = ({ navs }) => {
  const navigate = useNavigate()
  const [selectedKeys, setSelectedKeys] = useState([])

  const onClick: MenuProps['onClick'] = ({ item, key, keyPath, domEvent }) => {
    console.log('click ', { item, key, keyPath, domEvent })
    setSelectedKeys([key])
    navigate(item.path)
  }

  const subItems: MenuProps['items'] = navs.map(({ path, text }, index) => ({
    label: text,
    path,
    key: index,
  }))

  const items = [
    {
      label: <BsCaretDown />,
      key: 'menu',
      children: subItems,
    },
  ]

  return (
    <Menu
      onClick={onClick}
      selectedKeys={selectedKeys}
      mode="horizontal"
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
