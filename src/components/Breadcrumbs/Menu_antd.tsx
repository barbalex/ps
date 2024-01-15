import { useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import { BsCaretDown } from 'react-icons/bs'

export const MenuComponent = ({ navs }) => {
  const navigate = useNavigate()

  const onClick: MenuProps['onClick'] = ({ item, domEvent }) => {
    navigate(item.props.path)
    domEvent.stopPropagation()
  }

  const items = [
    {
      label: <BsCaretDown />,
      key: 'menu',
      children: navs.map(({ path, text }, index) => ({
        label: text,
        path,
        key: index,
      })),
    },
  ]

  return (
    <Menu onClick={onClick} selectedKeys={[]} mode="horizontal" items={items} />
  )
}
