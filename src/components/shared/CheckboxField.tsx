import * as fluentUiReactComponents from '@fluentui/react-components'
const { Checkbox } = fluentUiReactComponents
import type { CheckboxOnChangeData } from '@fluentui/react-components'

import styles from './CheckboxField.module.css'

type Props = {
  label?: string
  name?: string
  value?: boolean | null | string
  onChange?: (
    ev: React.ChangeEvent<any>,
    data?: any,
  ) => void
  autoFocus?: boolean
  size?: 'medium' | 'large'
  indeterminate?: boolean
  button?: React.ReactNode
  ref?: React.Ref<HTMLInputElement>
  validationMessage?: React.ReactNode
  validationState?: 'error' | 'warning' | 'success' | 'none'
}

export const CheckboxField = ({
  label = '(no label provided)',
  name,
  value,
  onChange: onChangeIn,
  autoFocus,
  size = 'large',
  indeterminate = false,
  button,
  ref,
}: Props) => {
  // consumers pass Fluent's (ev, data) change handlers;
  // called here with the computed checked value
  const onChangeOut = onChangeIn as unknown as (
    ev: React.ChangeEvent<HTMLInputElement>,
    data: { checked: 'mixed' | boolean | null },
  ) => void

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    { checked }: CheckboxOnChangeData,
  ) => {
    // if was true, set null
    // if was false, set true
    // if was null, set false
    const newValue =
      indeterminate === false
        ? checked
        : value === true
          ? null
          : value === false
            ? true
            : false
    onChangeOut(e, { checked: newValue })
  }

  const checked =
    (value === null || value === '') && indeterminate === true ? 'mixed' : value

  return (
    <div className={styles.container}>
      <Checkbox
        label={label}
        name={name}
        checked={checked as 'mixed' | boolean | undefined}
        onChange={onChange}
        autoFocus={autoFocus}
        ref={ref}
        size={size}
      />
      {button ? button : null}
    </div>
  )
}
