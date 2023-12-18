import { useState } from 'react'
import {
  makeStyles,
  shorthands,
  useId,
  Input,
  Label,
  Body1,
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
  body: {
    color: 'grey',
  },
})

export const TextFieldInactive = (props: InputProps) => {
  const inputId = useId('input')
  const styles = useStyles()

  const [changed, setChanged] = useState(false)

  return (
    <div className={styles.root}>
      <Label
        htmlFor={inputId}
        size={props.size ?? 'medium'}
        disabled={props.disabled ?? false}
      >
        {props.label ?? '(no label provided)'}
      </Label>
      <Input
        id={inputId}
        {...props}
        onChange={(e) => {
          console.log('TextFieldInactive onChange', {
            value: e.target.value,
            props,
            changed,
          })
          if (!changed && e.target.value !== props.value) {
            setChanged(true)
          }
        }}
        onBlur={() => {
          changed && setChanged(false)
        }}
      />
      {changed && (
        <Body1
          className={styles.body}
        >{`${props.label} can't be changed`}</Body1>
      )}
    </div>
  )
}
