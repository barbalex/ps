import {
  Vector_layers as VectorLayer,
  Wms_layers as WmsLayer,
} from '../../../../../generated/client/index.ts'

export const itemKey = Symbol('item')

export function isItemData(
  data: Record<string | symbol, unknown>,
): data is VectorLayer | WmsLayer {
  return data[itemKey] === true
}
