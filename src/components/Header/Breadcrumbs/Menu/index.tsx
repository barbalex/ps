import { forwardRef, memo } from 'react'
import {
  Menu as MenuComponent,
  MenuTrigger,
  MenuList,
  MenuPopover,
} from '@fluentui/react-components'
import { BsCaretDown } from 'react-icons/bs'

import { MenuItems } from './MenuItems'

const CustomMenuTrigger = forwardRef((props, ref) => (
  <div ref={ref} className="menu-icon" {...props}>
    <BsCaretDown />
  </div>
))

export const Menu = memo(({ navs }) => {
  if (!navs?.length) return null
  return (
    <MenuComponent openOnHover>
      <MenuTrigger>
        <CustomMenuTrigger />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItems navs={navs} />
        </MenuList>
      </MenuPopover>
    </MenuComponent>
  )
})
