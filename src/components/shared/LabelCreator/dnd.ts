export const labelCreatorItemKey = Symbol('labelCreatorItem')

export function isLabelCreatorData(data: Record<string | symbol, unknown>) {
  return data[labelCreatorItemKey] === true
}
