export const getValueFromChange = (e, data) => {
  const targetType = e.target.type
  console.log('hello getValueFromChange 1', {
    targetType,
    e,
    data,
    valueAsNumber: e.target.valueAsNumber,
    name: e.target.name,
    dataValue: data.value,
  })

  const name = e.target.name
  if (targetType === 'checkbox') {
    return { value: data.checked, name }
  }
  if (targetType === 'radio') {
    return { value: data.value, name }
  }
  if (targetType === 'change') {
    return { value: data.value, name }
  }
  if (targetType === 'number') {
    return {
      value: isNaN(e.target.valueAsNumber) ? null : data.valueAsNumber,
      name,
    }
  }
  if (targetType === 'range') {
    return {
      value: isNaN(e.target.valueAsNumber) ? null : data.valueAsNumber,
      name,
    }
  }
  return { value: e.target.value ?? null, name }
}
