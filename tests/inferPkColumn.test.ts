import { describe, it, expect } from 'vitest'

import { inferPkColumn } from '../src/modules/inferPkColumn.ts'

describe('inferPkColumn', () => {
  it('infers regular plurals (places → place_id)', () => {
    expect(inferPkColumn('places', { place_id: 'x' })).toBe('place_id')
  })

  it('infers -ies plurals (taxonomies → taxonomy_id)', () => {
    expect(inferPkColumn('taxonomies', { taxonomy_id: 'x' })).toBe(
      'taxonomy_id',
    )
  })

  it('maps irregular tables (taxa → taxon_id)', () => {
    expect(inferPkColumn('taxa', { taxon_id: 'x' })).toBe('taxon_id')
  })

  it('returns undefined when the candidate is missing from the draft', () => {
    expect(inferPkColumn('places', {})).toBeUndefined()
  })
})
