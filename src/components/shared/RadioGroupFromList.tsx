import { memo, useCallback } from 'react'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider.tsx'

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  userSelect: 'none',
}

export const RadioGroupFromList = memo(
  ({
    name,
    label,
    list_id,
    value: rowValue,
    onChange: onChangePassed,
    validationMessage,
    validationState,
    button,
  }) => {
    const { db } = useElectric()!
    const { results: listValues = [] } = useLiveQuery(
      db.list_values.liveMany({ where: { list_id } }),
    )

    const onClick = useCallback(
      (e) => {
        const valueChoosen = e.target.value
        // if valueChoosen equals rowValue, set rowValue to null
        // else set rowValue to valueChoosen
        onChangePassed(e, {
          value: valueChoosen === rowValue ? null : valueChoosen,
        })
      },
      [onChangePassed, rowValue],
    )

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
          >
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
          </RadioGroup>
          {!!button && button}
        </div>
      </Field>
    )
  },
)
