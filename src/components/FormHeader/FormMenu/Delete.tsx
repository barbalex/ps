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
  Tooltip,
} from '@fluentui/react-components'

export const Delete = memo(({ deleteRow, tableName }) => (
  <Menu openOnHover={false}>
    <MenuTrigger>
      <Tooltip content={`Delete ${tableName}`}>
        <Button
          size="medium"
          icon={<FaMinus />}
        />
      </Tooltip>
    </MenuTrigger>
    <MenuPopover>
      <MenuList>
        <MenuGroup>
          <MenuGroupHeader>Delete?</MenuGroupHeader>
          <MenuItem onClick={deleteRow}>Yes</MenuItem>
          <MenuItem>No</MenuItem>
        </MenuGroup>
      </MenuList>
    </MenuPopover>
  </Menu>
))
