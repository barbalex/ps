import {
  Vector_layers as VectorLayer,
  Tile_layers as TileLayer,
} from '../../../../../generated/client/index.ts'

export const itemKey = Symbol('item')

export function isItemData(
  data: Record<string | symbol, unknown>,
): data is VectorLayer | TileLayer {
  return data[itemKey] === true
}
