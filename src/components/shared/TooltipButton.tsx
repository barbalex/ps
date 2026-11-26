import { Button, Tooltip } from '@fluentui/react-components'
import type { ComponentProps } from 'react'

export const TooltipButton = ({
  label,
  ...props
}: ComponentProps<typeof Button> & { label: string }) => (
  <Tooltip content={label} relationship="label">
    <Button {...props} aria-label={label} disabledFocusable={props.disabled} />
  </Tooltip>
)
