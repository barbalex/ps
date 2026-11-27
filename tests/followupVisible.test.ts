import { describe, expect, it } from 'vitest'
import { followupVisible } from '../src/modules/followupVisible.ts'

const source = {
  field_id: 'a',
  name: 'source',
  followup_field_id: null,
  followup_answer: null,
  followup_test: null,
}
const dependent = {
  ...source,
  field_id: 'b',
  name: 'detail',
  followup_field_id: 'a',
}

describe('follow-up visibility', () => {
  it('distinguishes unanswered fields from No and zero', () => {
    for (const [value, answered] of [
      [false, true],
      [0, true],
      ['   ', false],
      [[], false],
      [null, false],
      [undefined, false],
    ] as const) {
      expect(followupVisible(dependent, [source], { source: value })).toBe(
        answered,
      )
      expect(
        followupVisible(
          { ...dependent, followup_test: 'unanswered' },
          [source],
          { source: value },
        ),
      ).toBe(!answered)
    }
  })
  it('compares scalar answers and selected codes without coercing text codes', () => {
    for (const [value, expected, show] of [
      [[0, '001'], '001', true],
      [['001'], '1', false],
      [1.5, '1,5', true],
      [false, 'false', true],
    ] as const) {
      expect(
        followupVisible(
          { ...dependent, followup_test: 'equals', followup_answer: expected },
          [source],
          { source: value },
        ),
      ).toBe(show)
    }
  })
  it('does not reveal a descendant from a hidden saved answer or recurse forever on a cycle', () => {
    const leaf = { ...dependent, field_id: 'c', followup_field_id: 'b' }
    expect(
      followupVisible(leaf, [source, dependent], { detail: 'retained' }),
    ).toBe(false)
    expect(
      followupVisible(leaf, [source, dependent], {
        source: false,
        detail: 'retained',
      }),
    ).toBe(true)
    expect(
      followupVisible(
        leaf,
        [{ ...source, followup_field_id: 'b' }, dependent],
        { source: true, detail: 'retained' },
      ),
    ).toBe(false)
  })
})
