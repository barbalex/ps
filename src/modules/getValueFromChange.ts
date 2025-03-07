import type { InputOnChangeData } from '@fluentui/react-components'

export const getValueFromChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  data: InputOnChangeData,
) => {
  const name = e.target.name
  const targetType = e.target.type

  console.log('getValueFromChange', { name, targetType, data, e })

  switch (targetType) {
    case 'checkbox':
      return { value: data?.checked, name, targetType }
    case 'radio': {
      if (data?.value === null) return { value: null, name, targetType }
      // numbers need to be converted to numbers
      return {
        value: !isNaN(data?.value) ? parseFloat(data?.value) : data?.value,
        name,
        targetType,
      }
    }
    case 'change':
      return { value: data?.value, name, targetType }
    case 'number':
      return {
        value: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
        name,
        targetType,
      }
    case 'range':
      return {
        value: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
        name,
        targetType,
      }
    default:
      return { value: e.target.value ?? null, name, targetType }
  }
}
