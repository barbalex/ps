import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { makeStyles, Input, Body1, Field } = fluentUiReactComponents
type InputProps = React.ComponentProps<typeof Input>

const useStyles = makeStyles({
  body: { color: 'grey' },
})

export const TextFieldInactive = (props: InputProps) => {
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
}
