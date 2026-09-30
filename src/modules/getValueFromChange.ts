import type { FieldChangeData } from '../components/shared/fieldChange.ts'

export const getValueFromChange = (
  e: React.ChangeEvent<HTMLElement>,
  data?: FieldChangeData,
) => {
  // handlers are shared between input, textarea and select fields and are
  // also invoked with synthetic events, so the target is read loosely
  const target = e.target as EventTarget & HTMLInputElement
  const name = target.name
  const targetType = target.type

  switch (targetType) {
    case 'checkbox':
      return {
        value: (data as { checked?: boolean })?.checked,
        name,
        targetType,
      }
    case 'radio': {
      if (data?.value === null) return { value: null, name, targetType }
      // numbers need to be converted to numbers
      return {
        value: !isNaN(data?.value as unknown as number)
          ? parseFloat(data?.value as string)
          : data?.value,
        name,
        targetType,
      }
    }
    case 'change':
      return { value: data?.value, name, targetType }
    case 'number':
      return {
        value: isNaN(target.valueAsNumber) ? null : target.valueAsNumber,
        name,
        targetType,
      }
    case 'range':
      return {
        value: isNaN(target.valueAsNumber) ? null : target.valueAsNumber,
        name,
        targetType,
      }
    default:
      return { value: target.value ?? null, name, targetType }
  }
}
