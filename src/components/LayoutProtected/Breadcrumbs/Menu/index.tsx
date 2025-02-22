import { forwardRef, memo, useCallback } from 'react'
import {
  Menu as MenuComponent,
  MenuTrigger,
  MenuList,
  MenuPopover,
} from '@fluentui/react-components'
import { BsCaretDown } from 'react-icons/bs'

import { MenuItems } from './MenuItems.tsx'

// TODO: what is this ref used for?
const CustomMenuTrigger = forwardRef((props, ref) => (
  <div ref={ref} className="menu-icon" {...props}>
    <BsCaretDown />
  </div>
))

export const Menu = memo(({ navs }) => {
  const onOpenChange = useCallback((e) => e.stopPropagation(), [])

  if (!navs?.length) return null

  return (
    <MenuComponent onOpenChange={onOpenChange}>
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
