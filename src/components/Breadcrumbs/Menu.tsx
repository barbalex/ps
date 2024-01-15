import { useNavigate } from 'react-router-dom'
import { MenuList, MenuItem, MenuPopover } from '@fluentui/react-components'

export const MenuPopover = ({ navs }) => {
  const navigate = useNavigate()

  // const onClick = ({ item, domEvent }) => {
  //   const path = navs.find((nav) => text === item.props.children).path
  //   navigate(item.props.path)
  //   domEvent.stopPropagation()
  // }

  console.log('MenuPopover, navs:', navs)

  return (
    <MenuPopover>
      <MenuList>
        {navs.map(({ path, text }, index) => (
          <MenuItem key={index} onClick={() => navigate(path)}>
            {text}
          </MenuItem>
        ))}
      </MenuList>
    </MenuPopover>
  )
}
