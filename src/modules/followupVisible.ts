import { parseDecimal } from './parseDecimal.ts'

type Rule = {
  field_id: string
  name: string | null
  followup_field_id: string | null
  followup_test: string | null
  followup_answer: string | null
}

const isAnswered = (value: unknown) =>
  value != null &&
  (typeof value !== 'string' || value.trim() !== '') &&
  (!Array.isArray(value) || value.length > 0)

const matches = (value: unknown, expected: string): boolean =>
  Array.isArray(value) ? value.some((code) => matches(code, expected))
  : typeof value === 'number' ? parseDecimal(expected) === value
  : typeof value === 'boolean' ? String(value) === expected
  : value === expected

export function followupVisible(
  field: Rule,
  fields: readonly Rule[],
  data: Record<string, unknown>,
) {
  const seen = new Set<string>()
  let rule = field
  while (rule.followup_field_id) {
    if (seen.has(rule.field_id)) return false
    seen.add(rule.field_id)
    const source = fields.find((f) => f.field_id === rule.followup_field_id)
    if (!source?.name) return false
    const answer = data[source.name]
    const answered = isAnswered(answer)
    const show =
      rule.followup_test === 'unanswered' ? !answered
      : rule.followup_test === 'equals' ?
        answered &&
        rule.followup_answer != null &&
        matches(answer, rule.followup_answer)
      : answered
    if (!show) return false
    rule = source
  }
  return true
}
