export const getValueFromChange = (e, data) => {
  console.log('occurrenceImport, getValueFromChange 1', {
    e,
    data,
  })
  const targetType = e.target.type
  const name = e.target.name
  console.log('occurrenceImport, getValueFromChange 2', {
    targetType,
    valueAsNumber: e.target.valueAsNumber,
    name,
    dataValue: data?.value,
  })

  switch (targetType) {
    case 'checkbox':
      return { value: data?.checked, name }
    case 'radio':
      return { value: data?.value, name }
    case 'change':
      return { value: data?.value, name }
    case 'number':
      return {
        value: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
        name,
      }
    case 'range':
      return {
        value: isNaN(e.target.valueAsNumber) ? null : data?.valueAsNumber,
        name,
      }
    default:
      return { value: e.target.value ?? null, name }
  }
}
