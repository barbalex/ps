import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, RadioGroup, Radio } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Loading } from './Loading.tsx'
import styles from './RadioGroupFromList.module.css'
import type ListValues from '../../models/public/ListValues.ts'

type FieldProps = React.ComponentProps<typeof Field>

type Props = {
  name: string
  label?: string
  list_id: string
  value: string
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    data?: { value?: string | null },
  ) => void
  validationMessage?: FieldProps['validationMessage']
  validationState?: 'error' | 'warning' | 'success' | 'none'
  autoFocus?: boolean
  ref?: React.Ref<HTMLInputElement>
  button?: React.ReactNode
}

export const RadioGroupFromList = ({
  name,
  label,
  list_id,
  value: rowValue,
  onChange: onChangePassed,
  validationMessage,
  validationState,
  autoFocus,
  ref,
  button,
}: Props) => {
  const res = useLiveQuery(`SELECT * FROM list_values WHERE list_id = $1`, [
    list_id,
  ])
  // rows are read with a `.value` property that does not exist as a column
  const listValues = (res?.rows ?? []) as unknown as (ListValues & {
    value?: string
  })[]

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    const valueChoosen = (e.target as HTMLInputElement).value
    // if valueChoosen equals rowValue, set rowValue to null
    // else set rowValue to valueChoosen
    onChangePassed(e as unknown as React.ChangeEvent<HTMLInputElement>, {
      value: valueChoosen === rowValue ? null : valueChoosen,
    })
  }

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div className={styles.row}>
        <RadioGroup
          layout="horizontal"
          name={name}
          value={rowValue}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLDivElement>}
        >
          {res === undefined ? (
            <Loading />
          ) : (
            <>
              {listValues.map(({ value: listValue }) => {
                return (
                  <Radio
                    key={listValue}
                    label={listValue}
                    value={listValue}
                    onClick={onClick}
                  />
                )
              })}
            </>
          )}
        </RadioGroup>
        {!!button && button}
      </div>
    </Field>
  )
}
