export const itemKey = Symbol('item')

export function isItemData(data: Record<string | symbol, unknown>) {
  return data[itemKey] === true
}
