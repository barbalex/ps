export type ListCode = string | number
export type MatchMode = '$any' | '$all'
export const isCodeArray = (value: unknown): value is ListCode[] =>
  Array.isArray(value) &&
  value.every(
    (v) =>
      typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v)),
  )

export function selectionFilter(value: unknown) {
  if (!value || typeof value !== 'object') return
  if ('$all' in value && isCodeArray(value.$all) && value.$all.length)
    return { mode: '$all' as const, codes: value.$all }
  if ('$any' in value && isCodeArray(value.$any) && value.$any.length)
    return { mode: '$any' as const, codes: value.$any }
}
