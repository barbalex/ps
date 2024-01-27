export const getValueFromChange = (e, data) => {
  const targetType = e.target.type
  console.log('hello getValueFromChange', {
    targetType,
    data,
    e,
    targetValueAsNumber: e.target.valueAsNumber,
    name: e.target.name,
  })
  const value =
    targetType === 'checkbox'
      ? data.checked
      : ['change'].includes[targetType]
      ? data.value
      : ['number', 'range'].includes(targetType)
      ? e.target.valueAsNumber ?? null
      : e.target.value ?? null
  const name = e.target.name
  console.log('hello getValueFromChange', { value })

  return { value, name }
}
