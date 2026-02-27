import { FaMinus } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'

const {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  MenuGroup,
  MenuGroupHeader,
  Tooltip,
} = fluentUiReactComponents

export const Delete = ({ deleteRow, tableName }) => (
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
)
