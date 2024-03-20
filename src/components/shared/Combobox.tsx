import {
  memo,
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Combobox as ComboboxComponent, Option, Field } from '@fluentui/react-components'

export const Combobox = memo(
  forwardRef(({ name, label, options, value, onChange, autoFocus }, ref) => {
    const [filter, setFilter] = useState('')

    const selectedOptions = useMemo(() => (value ? [value] : []), [value])
    useEffect(() => {
      const filter = selectedOptions[0]?.text ?? ''
      setFilter(filter)
    }, [selectedOptions, value])

    const onInput = useCallback(
      (event) => {
        const filter = event.target.value
        setFilter(filter)
      },
      [setFilter],
    )
    const onOptionSelect = useCallback(
      (e, data) => {
        if (data.optionValue === 0) return setFilter('') // No options found
        onChange({ target: { name, value: data.optionValue } })
      },
      [name, onChange],
    )

    return (
      <Field label={label ?? '(no label provided)'}>
        <ComboboxComponent
          name={name}
          value={filter}
          selectedOptions={[value]}
          onOptionSelect={onOptionSelect}
          onInput={onInput}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          freeform
        >
          {options.map((value) => (
            <Option text={value} value={value}></Option>
          ))}
        </ComboboxComponent>
      </Field>
    )
  }),
)
