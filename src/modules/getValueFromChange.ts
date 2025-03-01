import type { InputOnChangeData } from '@fluentui/react-components'

export const getValueFromChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  data: InputOnChangeData,
) => {
  const targetType = e.target.type
  const name = e.target.name

  switch (targetType) {
    case 'checkbox':
      return { value: data?.checked, name }
    case 'radio': {
      if (data?.value === null) return { value: null, name }
      // numbers need to be converted to numbers
      return {
        value: !isNaN(data?.value) ? parseFloat(data?.value) : data?.value,
        name,
      }
    }
    case 'change':
      return { value: data?.value, name }
    case 'number':
      return {
        value: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
        name,
      }
    case 'range':
      return {
        value: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
        name,
      }
    default:
      return { value: e.target.value ?? null, name }
  }
}
