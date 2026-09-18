import { orFilterToSql } from './orFilterToSql.ts'
import type { TableRowFilter } from '../store.ts'

export const filterStringFromFilter = (
  filter: TableRowFilter[],
  tablePrefix = '',
) => filter.map((f) => orFilterToSql(f, tablePrefix)).join(' OR ')
