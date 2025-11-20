import { Field, RadioGroup, Radio } from '@fluentui/react-components'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Loading } from './Loading.tsx'

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  userSelect: 'none',
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
}) => {
  const res = useLiveIncrementalQuery(
    `SELECT * FROM list_values WHERE list_id = $1`,
    [list_id],
    'list_value_id',
  )
  const listValues = res?.rows ?? []

  const onClick = (e) => {
    const valueChoosen = e.target.value
    // if valueChoosen equals rowValue, set rowValue to null
    // else set rowValue to valueChoosen
    onChangePassed(e, {
      value: valueChoosen === rowValue ? null : valueChoosen,
    })
  }

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div style={rowStyle}>
        <RadioGroup
          layout="horizontal"
          name={name}
          value={rowValue}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
        >
          {res === undefined ?
            <Loading />
          : <>
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
          }
        </RadioGroup>
        {!!button && button}
      </div>
    </Field>
  )
}
