import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { makeStyles, Input, Body1, Field } = fluentUiReactComponents
import { useIntl } from 'react-intl'
type InputProps = React.ComponentProps<typeof Input>
type FieldProps = React.ComponentProps<typeof Field>

const useStyles = makeStyles({
  body: { color: 'grey' },
})

type Props = Omit<InputProps, 'value'> &
  Pick<FieldProps, 'validationMessage' | 'validationState'> & {
    label?: string
    value?: string | number
  }

export const TextFieldInactive = (props: Props) => {
  const styles = useStyles()
  const { formatMessage } = useIntl()

  const [changed, setChanged] = useState(false)

  return (
    <Field
      label={
        props.label ??
        formatMessage({ id: 'bCQuRv', defaultMessage: '(kein Label)' })
      }
      validationMessage={props.validationMessage}
      validationState={props.validationState ?? 'none'}
    >
      <Input
        appearance="underline"
        {...props}
        value={(props.value ?? '') as string}
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
        <Body1 className={styles.body}>
          {formatMessage(
            {
              id: 'bCPrSt',
              defaultMessage: '{label} kann nicht geändert werden',
            },
            { label: props.label },
          )}
        </Body1>
      )}
    </Field>
  )
}
