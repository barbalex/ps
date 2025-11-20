import { Field, TagGroup, Tag } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { DropdownField } from './DropdownField.tsx'
import { idFieldFromTable } from '../../../modules/idFieldFromTable.ts'

const tabGroupStyle = { flexWrap: 'wrap', rowGap: 5 }

export const MultiSelect = ({
  name,
  label,
  table,
  options,
  id,
  valueArray = [],
  validationMessage,
  afterChange,
}) => {
  const optionValues = options.map((o) => o.value)
  const valueArrayValues = valueArray.map((v) => v.value)
  const db = usePGlite()
  const unusedOptions = options.filter(
    (o) => !valueArrayValues.includes(o.value),
  )

  const removeItem = (e, { value }) => {
    const idField = idFieldFromTable(table)
    // TODO: test if this works
    db.query(`UPDATE ${table} SET ${name} = $1 WHERE ${idField} = $2`, [
      valueArray.filter((v) => v.value !== value),
      id,
    ])
  }

  const onChange = ({ value, previousValue }) => {
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
    db.query(`UPDATE ${table} SET ${name} = $1 WHERE ${idField} = $2`, [
      val,
      id,
    ])
    if (afterChange) {
      afterChange(val)
    }
  }

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationState="none"
      validationMessage={validationMessage}
    >
      <TagGroup
        onDismiss={removeItem}
        style={tabGroupStyle}
      >
        {valueArray.map((value) => (
          <Tag
            key={value.value}
            dismissible
            dismissIcon={{ 'aria-label': 'remove' }}
            value={value.value}
            secondaryText={
              !optionValues.includes(value.value) ?
                'not found in options'
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
}
