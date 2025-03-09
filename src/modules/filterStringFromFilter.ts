import { orFilterToSql } from './orFilterToSql.ts'

export const filterStringFromFilter = (
  filter: Record<string, unknown>,
  tablePrefix: string,
) => filter.map((f) => ` (${orFilterToSql(f, tablePrefix)}) `).join(' OR ')
