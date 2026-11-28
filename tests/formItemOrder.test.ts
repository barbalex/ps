import { describe, expect, it } from 'vitest'

import {
  fieldComponentType,
  columnComponentType,
} from '../src/modules/formDesignComponents.ts'
import {
  fieldIdsOfOrder,
  formItemOrder,
  withDisplayOrder,
} from '../src/modules/formItemOrder.ts'

const field = fieldComponentType
const column = columnComponentType

// the place form: columns around three fields
const placeForm = {
  columnsBefore: ['level', 'name', 'since', 'until'],
  columnsAfter: ['relevant_for_reports'],
  fields: ['f1', 'f2', 'f3'],
}

describe('form item order', () => {
  it('is the fixed layout of the form when nothing is saved', () => {
    expect(formItemOrder(placeForm)).toEqual([
      column('level'),
      column('name'),
      column('since'),
      column('until'),
      field('f1'),
      field('f2'),
      field('f3'),
      column('relevant_for_reports'),
    ])
    expect(formItemOrder({ ...placeForm, saved: null })).toEqual(
      formItemOrder(placeForm),
    )
    expect(formItemOrder({ ...placeForm, saved: [] })).toEqual(
      formItemOrder(placeForm),
    )
  })

  it('follows the saved order for every item it names', () => {
    expect(
      formItemOrder({
        ...placeForm,
        saved: [
          field('f2'),
          column('name'),
          column('relevant_for_reports'),
          field('f1'),
          column('since'),
          field('f3'),
          column('until'),
          column('level'),
        ],
      }),
    ).toEqual([
      field('f2'),
      column('name'),
      column('relevant_for_reports'),
      field('f1'),
      column('since'),
      field('f3'),
      column('until'),
      column('level'),
    ])
  })

  it('drops saved items that no longer exist', () => {
    expect(
      formItemOrder({
        ...placeForm,
        columnsBefore: ['name'],
        columnsAfter: [],
        fields: ['f1'],
        saved: [field('gone'), column('gone'), field('f1'), column('name')],
      }),
    ).toEqual([field('f1'), column('name')])
  })

  it('adds new fields at the end of the fields', () => {
    expect(
      formItemOrder({
        ...placeForm,
        saved: [field('f2'), column('name'), field('f1')],
      }),
    ).toEqual([
      // the columns the saved order does not name take their fixed place
      column('level'),
      column('since'),
      column('until'),
      field('f2'),
      column('name'),
      field('f1'),
      field('f3'),
      column('relevant_for_reports'),
    ])
  })

  it('puts fields before the column that follows them when no field is saved', () => {
    expect(
      formItemOrder({
        ...placeForm,
        saved: [
          column('name'),
          column('relevant_for_reports'),
          column('since'),
        ],
      }),
    ).toEqual([
      column('level'),
      column('until'),
      column('name'),
      field('f1'),
      field('f2'),
      field('f3'),
      column('relevant_for_reports'),
      column('since'),
    ])
  })

  it('adds columns that were not saved at their fixed place: before the fields at the top, after them at the bottom', () => {
    // a column that only applies to some rows (the level shows in design mode only)
    expect(
      formItemOrder({
        ...placeForm,
        saved: [column('name'), field('f1'), column('since')],
      }),
    ).toEqual([
      column('level'),
      column('until'),
      column('name'),
      field('f1'),
      field('f2'),
      field('f3'),
      column('since'),
      column('relevant_for_reports'),
    ])
  })

  it('moves displayed items within the full order; a hidden item keeps its rank among them', () => {
    // f2 is not displayed (a follow-up question that is hidden right now)
    const order = [column('name'), field('f1'), field('f2'), field('f3')]
    const displayed = [column('name'), field('f1'), field('f3')]
    // name dropped below f3: f2 stays behind the second displayed item
    expect(
      withDisplayOrder({
        order,
        displayed,
        reordered: [field('f1'), field('f3'), column('name')],
      }),
    ).toEqual([field('f1'), field('f3'), field('f2'), column('name')])
    // unchanged when the drop changes nothing
    expect(
      withDisplayOrder({ order, displayed, reordered: displayed }),
    ).toEqual(order)
  })

  it('keeps sorted_field_ids in step with the item order', () => {
    expect(
      fieldIdsOfOrder([
        column('name'),
        field('f2'),
        column('since'),
        field('f1'),
      ]),
    ).toEqual(['f2', 'f1'])
  })
})
