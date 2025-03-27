import { memo } from 'react'
import { FaMinus } from 'react-icons/fa'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  MenuGroup,
  MenuGroupHeader,
} from '@fluentui/react-components'

export const Delete = memo(({ deleteRow, tableName }) => (
  <Menu>
    <MenuTrigger>
      <Button
        size="medium"
        icon={<FaMinus />}
        title={`Delete ${tableName}`}
      />
    </MenuTrigger>
    <MenuPopover>
      <MenuList>
        <MenuGroup>
          <MenuGroupHeader>Sure?</MenuGroupHeader>
          <MenuItem onClick={deleteRow}>Yes</MenuItem>
          <MenuItem>No</MenuItem>
        </MenuGroup>
      </MenuList>
    </MenuPopover>
  </Menu>
))
