import type { ComponentProps, FC } from 'react'
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
  Tooltip: TooltipComponent,
} = fluentUiReactComponents

// Fluent's Tooltip types require a `relationship` prop that is not passed here
const Tooltip = TooltipComponent as FC<
  Partial<ComponentProps<typeof TooltipComponent>>
>

interface Props {
  deleteRow: () => void
  deleteLabel?: string | null
  deleteConfirmLabel?: string | null
  disabled?: boolean
  /** accepted for compatibility, not used by Delete itself */
  tableName?: string
}

export const Delete = ({
  deleteRow,
  deleteLabel = null,
  deleteConfirmLabel = null,
  disabled = false,
}: Props) => {
  const { formatMessage } = useIntl()

  // the button is icon-only: the label makes it accessible (and testable) —
  // Fluent's tooltip content does not become its accessible name
  const label =
    deleteLabel ?? formatMessage({ id: 'Zv6sNt', defaultMessage: 'löschen' })

  return (
    <Menu openOnHover={false}>
      <MenuTrigger>
        <Tooltip content={label}>
          <Button
            size="medium"
            icon={<FaMinus />}
            disabled={disabled}
            aria-label={label}
          />
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
