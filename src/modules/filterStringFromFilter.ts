import { orFilterToSql } from './orFilterToSql.ts'

export const filterStringFromFilter = (filter, tablePrefix) =>
  filter.map((f) => ` (${orFilterToSql(f, tablePrefix)}) `).join(' OR ')
