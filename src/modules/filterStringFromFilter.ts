import { orFilterToSql } from './orFilterToSql.ts'

export const filterStringFromFilter = (filter) =>
  filter.map((f) => `(${orFilterToSql(f)})`).join(' OR ')
