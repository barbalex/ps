import { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { parseDecimal } from '../../modules/parseDecimal.ts'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Input, Field } = fluentUiReactComponents
type InputProps = React.ComponentProps<typeof Input>
type FieldProps = React.ComponentProps<typeof Field>

import styles from './TextField.module.css'
import type { FieldChangeHandler } from './fieldChange.ts'
import type Fields from '../../models/public/Fields.ts'

type Props = Omit<InputProps, 'onChange' | 'value'> &
  Pick<
    FieldProps,
    'label' | 'hint' | 'validationMessage' | 'validationState'
  > & {
    onChange?: FieldChangeHandler
    value?: string | number
    button?: React.ReactNode
    numericSettings?: Partial<
      Pick<
        Fields,
        'numeric_unit' | 'numeric_min' | 'numeric_max' | 'numeric_step'
      >
    > & { positive?: boolean }
  }

export const TextField = ({
  label,
  name,
  type = 'text',
  inputMode,
  onChange: onChangeIn,
  hint,
  validationMessage,
  validationState = 'none',
  placeholder,
  autoFocus,
  value,
  disabled = false,
  button,
  ref,
  tabIndex,
  readOnly,
  numericSettings,
}: Props) => {
  const { formatMessage } = useIntl()
  const decimal = inputMode === 'decimal'
  const [stateValue, setStateValue] = useState(
    value || value === 0 ? value : '',
  )

  useEffect(() => {
    setStateValue((draft) =>
      decimal && parseDecimal(String(draft)) === value ? draft : (value ?? ''),
    )
  }, [value, decimal])

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setStateValue(event.target.value)

  // consumers pass Fluent's (ev, data) change handlers;
  // from key events only the event is available
  const onChangeEvent = onChangeIn as
    ((event: React.SyntheticEvent<HTMLInputElement>) => void) | undefined
  const invalidDecimal =
    decimal && parseDecimal(String(stateValue)) === undefined
  const numericError = (() => {
    if (!numericSettings || stateValue === '') return ''
    const number = parseDecimal(String(stateValue))
    if (number == null) return ''
    if (type === 'number' && !Number.isInteger(number))
      return formatMessage({
        id: 'numericInteger',
        defaultMessage: 'Bitte eine Ganzzahl eingeben.',
      })
    if (numericSettings.positive && number <= 0)
      return formatMessage({
        id: 'numericPositive',
        defaultMessage: 'Die Schrittweite muss grösser als null sein.',
      })
    if (
      numericSettings.numeric_min == null &&
      numericSettings.numeric_max == null &&
      numericSettings.numeric_step == null
    )
      return ''
    // The comma-friendly text input cannot use native range/step validation.
    // Use the browser's number rules (including decimal step precision).
    const probe = document.createElement('input')
    probe.type = 'number'
    if (numericSettings.numeric_min != null)
      probe.min = String(numericSettings.numeric_min)
    if (numericSettings.numeric_max != null)
      probe.max = String(numericSettings.numeric_max)
    probe.step = String(numericSettings.numeric_step ?? 'any')
    probe.value = String(number)
    return probe.validationMessage
  })()
  const commit = (event: React.SyntheticEvent<HTMLInputElement>) => {
    if (
      !invalidDecimal &&
      !numericError &&
      !(numericSettings && event.currentTarget.validity.badInput)
    )
      onChangeEvent?.(event)
  }

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commit(event)
    }
  }

  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const inFilterForm = !!(event.target as HTMLElement | null)?.closest?.(
      '.form-container.filter',
    )
    if (inFilterForm) {
      commit(event)
    }
  }

  return (
    <Field
      label={label ?? name ?? '(no label provided)'}
      validationMessage={
        invalidDecimal ?
          formatMessage({
            id: 'decimalInvalid',
            defaultMessage: 'Bitte eine Dezimalzahl eingeben.',
          })
        : numericError || validationMessage
      }
      validationState={
        invalidDecimal || numericError ? 'error' : validationState
      }
      hint={hint}
      className={styles.field}
    >
      <div className={styles.row}>
        <Input
          name={name}
          value={stateValue as string}
          type={type}
          inputMode={inputMode}
          min={numericSettings?.numeric_min ?? undefined}
          max={numericSettings?.numeric_max ?? undefined}
          step={numericSettings?.numeric_step ?? undefined}
          contentAfter={numericSettings?.numeric_unit || undefined}
          placeholder={placeholder}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onKeyUp={onKeyUp}
          onBlur={commit}
          disabled={disabled}
          className={styles.input}
          tabIndex={tabIndex}
          readOnly={readOnly}
        />
        {!!button && button}
      </div>
    </Field>
  )
}
