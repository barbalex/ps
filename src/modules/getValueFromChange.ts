export const getValueFromChange = (e, data) => {
  const targetType = e.target.type
  const value =
    targetType === 'checkbox'
      ? data.checked
      : ['change'].includes[targetType]
      ? data.value
      : ['number', 'range'].includes(targetType)
      ? e.target.valueAsNumber ?? null
      : e.target.value ?? null
  const name = e.target.name

  return { value, name }
}
