import { describe, expect, it } from 'vitest'

import {
  columnComponentType,
  fieldComponentType,
  placedColumnNames,
  placedComponentTypes,
  placedFieldIds,
} from '../src/modules/formDesignComponents.ts'

// a design as Puck saves it: items at the root and inside the Grid's slot
const design = {
  content: [
    { type: 'Heading', props: { id: 'heading-0', text: 'Population' } },
    { type: fieldComponentType('f-1'), props: { id: 'field-1' } },
    {
      type: 'Grid',
      props: {
        id: 'grid-2',
        columns: 3,
        children: [
          { type: columnComponentType('date'), props: { id: 'column-3' } },
          {
            type: columnComponentType('relevant_for_reports'),
            props: { id: 'column-4' },
          },
          { type: fieldComponentType('f-2'), props: { id: 'field-5' } },
        ],
      },
    },
    { type: columnComponentType('name'), props: { id: 'column-6' } },
  ],
}

describe('form design components', () => {
  it('derives the component type of a jsonb key and of a real column', () => {
    expect(fieldComponentType('f-1')).toBe('field_f-1')
    expect(columnComponentType('date')).toBe('column_date')
  })

  it('collects the jsonb keys placed at the root and in slots', () => {
    expect(placedFieldIds(design)).toEqual(new Set(['f-1', 'f-2']))
  })

  it('collects the real columns placed at the root and in slots', () => {
    expect(placedColumnNames(design)).toEqual(
      new Set(['date', 'relevant_for_reports', 'name']),
    )
  })

  it('lists every placed component type once, layout blocks included', () => {
    expect(placedComponentTypes(design)).toEqual(
      new Set([
        'Heading',
        'Grid',
        'field_f-1',
        'field_f-2',
        'column_date',
        'column_relevant_for_reports',
        'column_name',
      ]),
    )
  })

  it('keeps jsonb keys and columns apart when they share a name', () => {
    const sameName = { content: [{ type: 'field_date', props: {} }] }
    expect(placedFieldIds(sameName)).toEqual(new Set(['date']))
    expect(placedColumnNames(sameName)).toEqual(new Set())

    const column = { content: [{ type: 'column_date', props: {} }] }
    expect(placedColumnNames(column)).toEqual(new Set(['date']))
    expect(placedFieldIds(column)).toEqual(new Set())
  })

  it('tolerates missing, empty and malformed designs', () => {
    for (const empty of [
      null,
      undefined,
      {},
      { content: [] },
      { content: 1 },
    ]) {
      expect(placedFieldIds(empty)).toEqual(new Set())
      expect(placedColumnNames(empty)).toEqual(new Set())
    }
    const malformed = {
      content: [null, 'x', 42, { props: {} }, { type: 7, props: {} }],
    }
    expect(placedComponentTypes(malformed)).toEqual(new Set())
  })
})
