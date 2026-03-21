import { FaMinus } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { useIntl } from 'react-intl'

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

export const Delete = ({
  deleteRow,
  deleteLabel = null,
  deleteConfirmLabel = null,
}) => {
  const { formatMessage } = useIntl()

  return (
    <Menu openOnHover={false}>
      <MenuTrigger>
        <Tooltip
          content={
            deleteLabel ??
            formatMessage({ id: 'Zv6sNt', defaultMessage: 'l\u00f6schen' })
          }
        >
          <Button size="medium" icon={<FaMinus />} />
        </Tooltip>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuGroup>
            <MenuGroupHeader>
              {deleteConfirmLabel ??
                formatMessage({
                  id: 'Au7tOu',
                  defaultMessage: 'L\u00f6schen?',
                })}
            </MenuGroupHeader>
            <MenuItem onClick={deleteRow}>
              {formatMessage({ id: 'Bv8uPv', defaultMessage: 'Ja' })}
            </MenuItem>
            <MenuItem>
              {formatMessage({ id: 'Cw9vQw', defaultMessage: 'Nein' })}
            </MenuItem>
          </MenuGroup>
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
