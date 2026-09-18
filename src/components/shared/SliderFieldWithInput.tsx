import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, Slider, Label, Input } = fluentUiReactComponents
type InputProps = React.ComponentProps<typeof Input>
type SliderProps = React.ComponentProps<typeof Slider>
type FieldProps = React.ComponentProps<typeof Field>
import { useDebouncedCallback } from 'use-debounce'

import styles from './SliderFieldWithInput.module.css'

type Props = Pick<SliderProps, 'min' | 'step' | 'onChange'> &
  Pick<FieldProps, 'label' | 'validationMessage' | 'validationState'> & {
    name: string
    max: number
    value?: number | string
    autoFocus?: boolean
    ref?: InputProps['ref']
  }

export const SliderFieldWithInput = (props: Props) => {
  const {
    label,
    name,
    min,
    max,
    step,
    value,
    onChange,
    validationMessage,
    validationState = 'none',
    autoFocus,
    ref,
  } = props

  // need to debounce changes when sliding or slider will not render correctly
  // do not use a small value or if slid slowly the user will loose the drag
  const onChangeSliderDebounced = useDebouncedCallback(onChange!, 300)
  const inputWidthClass =
    max > 10000000
      ? styles.inputWidth9
      : max > 100000
        ? styles.inputWidth8
        : max > 10000
          ? styles.inputWidth7
          : max > 100
            ? styles.inputWidth6
            : styles.inputWidth5

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div className={styles.container}>
        <div className={styles.sliderContainer}>
          <Label aria-hidden>{min}</Label>
          <Slider
            key={value}
            name={name}
            min={min}
            max={max}
            step={step ?? undefined}
            defaultValue={value as number | undefined}
            onChange={onChangeSliderDebounced}
            className={styles.slider}
          />
          <Label aria-hidden>{max}</Label>
        </div>
        <Input
          name={name}
          min={min}
          max={max}
          step={step}
          value={value as string}
          onChange={onChangeSliderDebounced as unknown as InputProps['onChange']}
          type="number"
          appearance="outline"
          autoFocus={autoFocus}
          ref={ref}
          className={inputWidthClass}
        />
      </div>
    </Field>
  )
}
