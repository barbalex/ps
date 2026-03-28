type HistoryRowLike = Record<string, unknown>

type GetDiffFieldsArgs<TRow extends HistoryRowLike> = {
  row: TRow | undefined
  selectedHistory: TRow | undefined
  visibleCurrentFields: Set<string>
  excludedDisplayFields: Set<string>
  alwaysIgnoreDiffFields?: Set<string>
}

type GetDisplayFieldsArgs<TRow extends HistoryRowLike> = {
  selectedHistory: TRow | undefined
  preferredOrder: string[]
  visibleCurrentFields: Set<string>
  excludedDisplayFields: Set<string>
  metaFields?: string[]
}

export const stringifyHistoryValue = (value: unknown) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export const areHistoryValuesSame = (a: unknown, b: unknown) =>
  stringifyHistoryValue(a) === stringifyHistoryValue(b)

export const getDiffFields = <TRow extends HistoryRowLike>({
  row,
  selectedHistory,
  visibleCurrentFields,
  excludedDisplayFields,
  alwaysIgnoreDiffFields = new Set(['updated_at', 'updated_by', 'deleted']),
}: GetDiffFieldsArgs<TRow>) => {
  if (!row || !selectedHistory) return [] as string[]

  return Object.keys(selectedHistory).filter((field) => {
    if (!visibleCurrentFields.has(field)) return false
    if (excludedDisplayFields.has(field)) return false
    if (alwaysIgnoreDiffFields.has(field)) return false
    return !areHistoryValuesSame(selectedHistory[field], row[field])
  })
}

export const getDisplayFields = <TRow extends HistoryRowLike>({
  selectedHistory,
  preferredOrder,
  visibleCurrentFields,
  excludedDisplayFields,
  metaFields = ['updated_at', 'updated_by', 'deleted'],
}: GetDisplayFieldsArgs<TRow>) => {
  if (!selectedHistory) return [] as string[]

  const currentFields = preferredOrder.filter(
    (field) =>
      visibleCurrentFields.has(field) &&
      !excludedDisplayFields.has(field) &&
      Object.hasOwn(selectedHistory, field),
  )

  const visibleMetaFields = metaFields.filter((field) =>
    Object.hasOwn(selectedHistory, field),
  )

  return [...currentFields, ...visibleMetaFields]
}