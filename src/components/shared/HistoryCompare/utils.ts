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

type HistoryFieldLabel = {
  id: string
  defaultMessage: string
  values?: Record<string, unknown>
}

type HistoryFieldLabelMap = Record<string, HistoryFieldLabel>

type HistoryFieldValueDescriptor = {
  id: string
  defaultMessage: string
}

type HistoryFieldBooleanValueConfig = {
  trueLabel: HistoryFieldValueDescriptor
  falseLabel: HistoryFieldValueDescriptor
}

type HistoryFieldValueConfig<TRow extends HistoryRowLike> = {
  booleanLabels?: HistoryFieldBooleanValueConfig
  format?: (value: unknown, history: TRow) => unknown
}

type HistoryFieldValueMap<TRow extends HistoryRowLike> = Record<
  string,
  HistoryFieldValueConfig<TRow>
>

type FormatMessage = (
  descriptor: { id: string; defaultMessage: string },
  values?: Record<string, unknown>,
) => string

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

export const formatHistoryFieldLabel = ({
  field,
  formatMessage,
  fieldLabelMap,
}: {
  field: string
  formatMessage: FormatMessage
  fieldLabelMap: HistoryFieldLabelMap
}) => {
  const configuredLabel = fieldLabelMap[field]
  if (!configuredLabel) return field

  return formatMessage(
    {
      id: configuredLabel.id,
      defaultMessage: configuredLabel.defaultMessage,
    },
    configuredLabel.values,
  )
}

export const createHistoryFieldLabelFormatter = ({
  formatMessage,
  fieldLabelMap,
}: {
  formatMessage: FormatMessage
  fieldLabelMap: HistoryFieldLabelMap
}) => {
  return (field: string) =>
    formatHistoryFieldLabel({ field, formatMessage, fieldLabelMap })
}

export const formatHistoryFieldValue = <TRow extends HistoryRowLike>({
  field,
  history,
  formatMessage,
  fieldValueMap,
}: {
  field: string
  history: TRow
  formatMessage: FormatMessage
  fieldValueMap: HistoryFieldValueMap<TRow>
}) => {
  const configuredValue = fieldValueMap[field]
  if (!configuredValue) return stringifyHistoryValue(history[field])

  if (configuredValue.booleanLabels) {
    return formatMessage(
      Boolean(history[field])
        ? configuredValue.booleanLabels.trueLabel
        : configuredValue.booleanLabels.falseLabel,
    )
  }

  if (configuredValue.format) {
    return stringifyHistoryValue(configuredValue.format(history[field], history))
  }

  return stringifyHistoryValue(history[field])
}

export const createHistoryFieldValueFormatter = <TRow extends HistoryRowLike>({
  formatMessage,
  fieldValueMap,
}: {
  formatMessage: FormatMessage
  fieldValueMap: HistoryFieldValueMap<TRow>
}) => {
  return (field: string, history: TRow) =>
    formatHistoryFieldValue({ field, history, formatMessage, fieldValueMap })
}