import { useState } from 'react'
import { useIntl } from 'react-intl'
import { ToggleButton } from '@fluentui/react-components'
import styles from './NullableBooleanButtons.module.css'

type Props = {
  label: string
  value: unknown
  onChange: (value: boolean | null | undefined) => void
  filter?: boolean
  preview?: boolean
  print?: boolean
  button?: React.ReactNode
  autoFocus?: boolean
  validationMessage?: string
}

export function NullableBooleanButtons({
  label,
  value,
  onChange,
  filter,
  preview,
  print,
  button,
  autoFocus,
  validationMessage,
}: Props) {
  const { formatMessage } = useIntl()
  const [draft, setDraft] = useState(value)
  const current = preview ? draft : value
  const selected =
    current === true || current === false ? current
    : filter && current === undefined ? undefined
    : null
  const choices = [
    ...(filter ?
      [
        {
          value: undefined,
          label: formatMessage({ id: 'areaFilterAll', defaultMessage: 'Alle' }),
        },
      ]
    : []),
    {
      value: true,
      label: formatMessage({ id: 'bCommonYes', defaultMessage: 'Ja' }),
    },
    {
      value: false,
      label: formatMessage({ id: 'bCommonNo', defaultMessage: 'Nein' }),
    },
    {
      value: null,
      label: formatMessage({
        id: 'booleanNotAssessed',
        defaultMessage: 'Nicht beurteilt',
      }),
    },
  ]
  return (
    <fieldset className={styles.field}>
      <legend>{label}</legend>
      {print ?
        choices.find((choice) => choice.value === selected)?.label
      : <div className={styles.choices}>
          {choices.map((choice, index) => (
            <ToggleButton
              key={String(choice.value)}
              type="button"
              checked={selected === choice.value}
              autoFocus={autoFocus && index === 0}
              onClick={() =>
                preview ? setDraft(choice.value) : onChange(choice.value)
              }
            >
              {choice.label}
            </ToggleButton>
          ))}
          {button}
        </div>
      }
      {validationMessage && <span role="alert">{validationMessage}</span>}
    </fieldset>
  )
}
