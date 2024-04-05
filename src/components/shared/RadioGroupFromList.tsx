import { memo } from 'react'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const RadioGroupFromList = memo(
  ({
    name,
    label,
    list_id,
    value: rowValue,
    onChange,
    validationMessage,
    validationState,
    button,
  }) => {
    const { db } = useElectric()!
    const { results: listValues = [] } = useLiveQuery(
      db.list_values.liveMany({ where: { list_id } }),
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
            onChange={onChange}
            appearance="underline"
          >
            {listValues.map(({ value: listValue }) => {
              return (
                <Radio key={listValue} label={listValue} value={listValue} />
              )
            })}
          </RadioGroup>
          {!!button && button}
        </div>
      </Field>
    )
  },
)
