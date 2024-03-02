export const getValueFromChange = (e, data) => {
  const targetType = e.target.type
  let value =
    targetType === 'checkbox'
      ? data.checked
      : ['change'].includes[targetType]
      ? data.value
      : ['number', 'range'].includes(targetType)
      ? e.target.valueAsNumber ?? null
      : e.target.value ?? null
  // happens when a number input is emptied
  if (isNaN(value)) value = null
  const name = e.target.name

  return { value, name }
}
