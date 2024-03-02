export const getValueFromChange = (e, data) => {
  const targetType = e.target.type
  const name = e.target.name
  // console.log('hello getValueFromChange 1', {
  //   targetType,
  //   e,
  //   data,
  //   valueAsNumber: e.target.valueAsNumber,
  //   name,
  //   dataValue: data.value,
  // })

  switch (targetType) {
    case 'checkbox':
      return { value: data.checked, name }
    case 'radio':
      return { value: data.value, name }
    case 'change':
      return { value: data.value, name }
    case 'number':
      return {
        value: isNaN(e.target.valueAsNumber) ? null : data.valueAsNumber,
        name,
      }
    case 'range':
      return {
        value: isNaN(e.target.valueAsNumber) ? null : data.valueAsNumber,
        name,
      }
    default:
      return { value: e.target.value ?? null, name }
  }
}
