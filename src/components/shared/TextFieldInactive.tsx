import { memo, useState } from 'react'
import { makeStyles, Input, Body1, Field } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

const useStyles = makeStyles({
  body: { color: 'grey' },
})

export const TextFieldInactive = memo((props: InputProps) => {
  const styles = useStyles()

  const [changed, setChanged] = useState(false)

  return (
    <Field
      label={props.label ?? '(no label provided)'}
      validationMessage={props.validationMessage}
      validationState={props.validationState ?? 'none'}
    >
      <Input
        appearance="underline"
        {...props}
        value={props.value ?? ''}
        onChange={(e) => {
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
    </Field>
  )
})
