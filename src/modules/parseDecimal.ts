// Field input accepts either decimal separator, never grouping separators.
export const parseDecimal = (source: string): number | null | undefined => {
  if (source === '') return null
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(source))
    return undefined
  const number = Number(source.replace(',', '.'))
  return Number.isFinite(number) ? number : undefined
}
