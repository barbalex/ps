import { memo, useMemo, useCallback } from 'react'
import { Field, TagGroup, Tag } from '@fluentui/react-components'

import { useElectric } from '../../../ElectricProvider'
import { DropdownField } from './DropdownField'
import { idFieldFromTable } from '../../../modules/idFieldFromTable'

const tabGroupStyle = { flexWrap: 'wrap', rowGap: 5 }

export const MultiSelect = memo(
  ({ name, label, table, options, id, valueArray = [] }) => {
    const optionValues = useMemo(() => options.map((o) => o.value), [options])
    const valueArrayValues = useMemo(
      () => valueArray.map((v) => v.value),
      [valueArray],
    )
    const { db } = useElectric()
    const unusedOptions = useMemo(
      () => options.filter((o) => !valueArrayValues.includes(o.value)),
      [options, valueArrayValues],
    )

    const removeItem = useCallback(
      (e, { value }) => {
        const idField = idFieldFromTable(table)
        db[table].update({
          where: { [idField]: id },
          data: { [name]: valueArray.filter((v) => v.value !== value) },
        })
      },
      [db, id, name, table, valueArray],
    )

    const onChange = useCallback(
      ({ value, previousValue }) => {
        const option = options.find((o) => o.value === value)
        let val = [...valueArray]
        if (!value) {
          // need to remove the key from the json object
          val = val.filter((v) => v.value !== previousValue.value)
        } else {
          // replace the previous value with the new value
          const index = val.findIndex((v) => v.value === previousValue.value)
          if (index !== -1) {
            val[index] = option
          } else {
            val.push(option)
          }
        }
        const idField = idFieldFromTable(table)
        db[table].update({
          where: { [idField]: id },
          data: { [name]: val },
        })
      },
      [db, id, name, options, table, valueArray],
    )

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationState="none"
        validationMessage={
          <>
            <div>{`Add multiple items in the order you want Layers to be ordered.`}</div>
            <div>{`If no value is set, Layers are ordered by label.`}</div>
          </>
        }
      >
        <TagGroup onDismiss={removeItem} style={tabGroupStyle}>
          {valueArray.map((value) => (
            <Tag
              key={value.value}
              dismissible
              dismissIcon={{ 'aria-label': 'remove' }}
              value={value.value}
              secondaryText={
                !optionValues.includes(value.value)
                  ? 'not defined in WMS Layers'
                  : undefined
              }
            >
              {value.label}
            </Tag>
          ))}
          {unusedOptions.length > 0 && (
            <DropdownField
              placeholder="Select an option"
              value={''}
              onChange={onChange}
              options={unusedOptions}
            />
          )}
        </TagGroup>
      </Field>
    )
  },
)
