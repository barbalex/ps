import { memo } from 'react'
import {
  makeStyles,
  shorthands,
  useId,
  Input,
  Label,
} from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

const useStyles = makeStyles({
  root: {
    // Stack the label above the field
    display: 'flex',
    flexDirection: 'column',
    // Use 2px gap below the label (per the design system)
    ...shorthands.gap('2px'),
  },
})

export const TextField = memo((props: InputProps) => {
  const inputId = useId('input')
  const styles = useStyles()
  const { size, disabled, label } = props

  return (
    <div className={styles.root}>
      <Label
        htmlFor={inputId}
        size={size ?? 'medium'}
        disabled={disabled ?? false}
      >
        {label ?? '(no label provided)'}
      </Label>
      <Input id={inputId} {...props} />
    </div>
  )
})
