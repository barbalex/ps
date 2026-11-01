import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests the update aggregation: field edits are buffered per row and merged
 * into ONE queued operation per row and form session (per-field writes are
 * what churns the history tables), flushed when the session ends — debounce,
 * form blur, tab hide, page close — and healed on boot from localStorage.
 *
 * The modules are imported dynamically so the window/document/localStorage
 * mocks are in place before store.ts loads (it initialises the aggregation).
 */

type Listener = (event: unknown) => void
type EventName = 'focusout' | 'visibilitychange' | 'pagehide'

const createMocks = () => {
  const storage = new Map<string, string>()
  const listeners: Record<EventName, Listener[]> = {
    focusout: [],
    visibilitychange: [],
    pagehide: [],
  }
  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  }
  const documentMock = {
    visibilityState: 'visible',
    addEventListener: (name: EventName, cb: Listener) => {
      listeners[name].push(cb)
    },
  }
  const windowMock = {
    localStorage: localStorageMock,
    addEventListener: documentMock.addEventListener,
  }
  const fire = (name: EventName, event: unknown) => {
    for (const listener of [...listeners[name]]) listener(event)
  }
  const reset = () => {
    storage.clear()
    for (const name of Object.keys(listeners) as EventName[]) {
      listeners[name].length = 0
    }
    documentMock.visibilityState = 'visible'
  }
  return { storage, documentMock, windowMock, fire, reset }
}

const mocks = createMocks()
;(globalThis as Record<string, unknown>).window = mocks.windowMock
;(globalThis as Record<string, unknown>).document = mocks.documentMock

// a fake element tree: closest answers for the form region and Fluent's
// [data-portal-node] overlays, the form answers contains for membership
const makeElement = ({ form, portal = false }: { form?: unknown; portal?: boolean }) => ({
  closest: (selector: string) => {
    if (selector.includes('form-') && form) return form
    if (selector.includes('data-portal-node') && portal) return { portal: true }
    return null
  },
})

const form = { contains: (element: unknown) => containedByForm.has(element) }
const containedByForm = new Set<unknown>()

type AggregationModule = typeof import('../src/modules/operationAggregation.ts')
type StoreModule = typeof import('../src/store.ts')

let aggregation: AggregationModule
let store: StoreModule

const baseOp = {
  table: 'places',
  rowIdName: 'place_id',
  rowId: 'place-1',
  operation: 'update',
  draft: { name: 'new' },
  prev: {
    place_id: 'place-1',
    name: 'old',
    label: 'old label',
    updated_at: '2026-01-01T00:00:00.000Z',
    updated_by: 'user@example.com',
  },
} as const

beforeEach(async () => {
  mocks.reset()
  containedByForm.clear()
  aggregation = await import('../src/modules/operationAggregation.ts')
  store = await import('../src/store.ts')
  // store.ts registered its enqueue at import; per-test inits re-register
  aggregation.__resetOperationAggregationForTests()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('isAggregatableUpdate', () => {
  it('aggregates single-row, draft-based updates', () => {
    expect(aggregation.isAggregatableUpdate(baseOp)).toBe(true)
  })

  it('passes through every other operation shape', () => {
    expect(aggregation.isAggregatableUpdate({ ...baseOp, operation: 'insert' })).toBe(false)
    expect(aggregation.isAggregatableUpdate({ ...baseOp, operation: 'delete' })).toBe(false)
    expect(aggregation.isAggregatableUpdate({ ...baseOp, operation: 'upsert' })).toBe(false)
    // filter-based updates have no single row to key the buffer on
    expect(
      aggregation.isAggregatableUpdate({
        ...baseOp,
        filter: { function: 'eq', column: 'level', value: 1 },
      }),
    ).toBe(false)
    expect(aggregation.isAggregatableUpdate({ ...baseOp, filters: [] })).toBe(false)
    // many-rows drafts are not field edits
    expect(aggregation.isAggregatableUpdate({ ...baseOp, draft: [{ name: 'new' }] })).toBe(false)
    expect(aggregation.isAggregatableUpdate({ ...baseOp, rowId: undefined })).toBe(false)
  })
})

describe('buffering', () => {
  it('merges edits of the same row: latest draft per field, pre-session prev', () => {
    aggregation.registerAggregatedUpdate(baseOp)
    aggregation.registerAggregatedUpdate({
      ...baseOp,
      draft: { label: 'a label' },
      prev: { ...baseOp.prev },
    })
    // name is re-edited: its prev must stay the value before the session
    aggregation.registerAggregatedUpdate({
      ...baseOp,
      draft: { name: 'newer' },
      prev: { ...baseOp.prev, name: 'new' },
    })

    const entries = aggregation.getAggregatedUpdates()
    expect(entries).toHaveLength(1)
    expect(entries[0]!.draft).toEqual({ name: 'newer', label: 'a label' })
    expect(entries[0]!.prev.name).toBe('old')
    expect(entries[0]!.prev.label).toBe('old label')
    // audit columns come from the session's first prev: the revert target
    expect(entries[0]!.prev.updated_at).toBe(baseOp.prev.updated_at)
    expect(entries[0]!.prev.updated_by).toBe(baseOp.prev.updated_by)
  })

  it('keeps rows apart', () => {
    aggregation.registerAggregatedUpdate(baseOp)
    aggregation.registerAggregatedUpdate({ ...baseOp, rowId: 'place-2' })
    expect(aggregation.getAggregatedUpdates()).toHaveLength(2)
  })

  it('persists the buffer for the boot heal', () => {
    aggregation.registerAggregatedUpdate(baseOp)
    expect(mocks.storage.get('ps-aggregated-updates')).toBeTruthy()
  })

  it('clearAggregatedUpdates drops everything', () => {
    aggregation.registerAggregatedUpdate(baseOp)
    aggregation.clearAggregatedUpdates()
    expect(aggregation.getAggregatedUpdates()).toHaveLength(0)
    expect(mocks.storage.get('ps-aggregated-updates')).toBe('[]')
  })
})

describe('flushing', () => {
  it('flushes via debounce ~5s after the last change, one operation per row', () => {
    vi.useFakeTimers()
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })

    aggregation.registerAggregatedUpdate(baseOp)
    aggregation.registerAggregatedUpdate({ ...baseOp, draft: { label: 'a label' } })
    vi.advanceTimersByTime(4_999)
    expect(enqueue).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(enqueue).toHaveBeenCalledTimes(1)

    const [operation] = enqueue.mock.calls[0]![0]
    expect(operation.operation).toBe('update')
    expect(operation.table).toBe('places')
    expect(operation.rowId).toBe('place-1')
    expect(operation.draft).toEqual({ name: 'new', label: 'a label' })
    expect(operation.prev.name).toBe('old')
    expect(aggregation.getAggregatedUpdates()).toHaveLength(0)
  })

  it('debounces per row: an expiring timer flushes only its own row', () => {
    vi.useFakeTimers()
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })

    aggregation.registerAggregatedUpdate(baseOp)
    vi.advanceTimersByTime(2_000)
    aggregation.registerAggregatedUpdate({ ...baseOp, rowId: 'place-2' })
    vi.advanceTimersByTime(3_000)

    // place-1's 5s elapsed, place-2 edited 3s ago: only place-1 flushes
    expect(enqueue).toHaveBeenCalledTimes(1)
    expect(enqueue.mock.calls[0]![0]).toHaveLength(1)
    expect(enqueue.mock.calls[0]![0][0].rowId).toBe('place-1')
    expect(aggregation.getAggregatedUpdates().map((entry) => entry.rowId)).toEqual([
      'place-2',
    ])

    vi.advanceTimersByTime(2_000)
    expect(enqueue).toHaveBeenCalledTimes(2)
    expect(enqueue.mock.calls[1]![0][0].rowId).toBe('place-2')
  })

  it('flushes rows in first-edit order', () => {
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })
    aggregation.registerAggregatedUpdate(baseOp)
    aggregation.registerAggregatedUpdate({ ...baseOp, rowId: 'place-2' })
    const operations = aggregation.flushAggregatedUpdates()
    expect(operations.map((operation) => operation.rowId)).toEqual(['place-1', 'place-2'])
  })

  it('enqueues nothing when the buffer is empty', () => {
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })
    expect(aggregation.flushAggregatedUpdates()).toEqual([])
    expect(enqueue).not.toHaveBeenCalled()
  })

  it('boot-heals buffered edits from a crashed session', () => {
    // a previous session died before flushing: its buffer is in storage
    mocks.storage.set(
      'ps-aggregated-updates',
      JSON.stringify([
        {
          table: 'places',
          rowIdName: 'place_id',
          rowId: 'place-1',
          draft: { name: 'unflushed' },
          prev: { name: 'old' },
        },
      ]),
    )
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })
    expect(enqueue).toHaveBeenCalledTimes(1)
    expect(enqueue.mock.calls[0]![0][0].draft).toEqual({ name: 'unflushed' })
    expect(aggregation.getAggregatedUpdates()).toHaveLength(0)
  })
})

describe('session-end triggers', () => {
  it('flushes when the focus leaves the form', () => {
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })
    aggregation.registerAggregatedUpdate(baseOp)

    mocks.fire('focusout', { target: makeElement({ form }), relatedTarget: makeElement({}) })
    expect(enqueue).toHaveBeenCalledTimes(1)
  })

  it('keeps buffering while the focus stays inside the form', () => {
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })
    aggregation.registerAggregatedUpdate(baseOp)

    const nextField = makeElement({ form })
    containedByForm.add(nextField)
    mocks.fire('focusout', { target: makeElement({ form }), relatedTarget: nextField })
    expect(enqueue).not.toHaveBeenCalled()
  })

  it('keeps buffering while the focus moves into a form control portal (dropdown, dialog)', () => {
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })
    aggregation.registerAggregatedUpdate(baseOp)

    mocks.fire('focusout', {
      target: makeElement({ form }),
      relatedTarget: makeElement({ portal: true }),
    })
    expect(enqueue).not.toHaveBeenCalled()
  })

  it('lets the debounce decide when the focus merely vanishes', () => {
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })
    aggregation.registerAggregatedUpdate(baseOp)

    mocks.fire('focusout', { target: makeElement({ form }), relatedTarget: null })
    expect(enqueue).not.toHaveBeenCalled()
  })

  it('flushes on tab hide and page close', () => {
    const enqueue = vi.fn()
    aggregation.initOperationAggregation({ enqueue })
    aggregation.registerAggregatedUpdate(baseOp)

    mocks.documentMock.visibilityState = 'hidden'
    mocks.fire('visibilitychange', {})
    expect(enqueue).toHaveBeenCalledTimes(1)

    aggregation.registerAggregatedUpdate(baseOp)
    mocks.fire('pagehide', {})
    expect(enqueue).toHaveBeenCalledTimes(2)
  })
})

describe('addOperationAtom routes through the aggregation', () => {
  beforeEach(() => {
    // re-wire the enqueue like store.ts does at import (the per-test reset
    // nullified it); no pglite db/user exists in tests, so addOperationAtom
    // skips its permission check
    aggregation.initOperationAggregation({
      enqueue: (ops) => {
        const opQueue = store.store.get(store.operationsQueueAtom)
        store.store.set(store.operationsQueueAtom, [...ops.slice().reverse(), ...opQueue])
      },
    })
    store.store.set(store.operationsQueueAtom, [])
  })

  it('buffers field-edit updates instead of queueing them', () => {
    void store.store.set(store.addOperationAtom, baseOp)

    expect(store.store.get(store.operationsQueueAtom)).toHaveLength(0)
    expect(aggregation.getAggregatedUpdates()).toHaveLength(1)
  })

  it('flushes buffered edits ahead of pass-through operations, queue stays newest-first', () => {
    void store.store.set(store.addOperationAtom, baseOp)
    void store.store.set(store.addOperationAtom, { ...baseOp, rowId: 'place-2' })
    // a non-aggregatable operation goes straight to the queue and must
    // carry the buffered edits with it, behind itself in execution order
    void store.store.set(store.addOperationAtom, {
      ...baseOp,
      operation: 'delete',
      draft: undefined,
    })

    const queue = store.store.get(store.operationsQueueAtom)
    // queue is newest-first; the observer executes oldest (last) first:
    // place-1 update, place-2 update, then the delete
    expect(queue.map((operation) => [operation.operation, operation.rowId])).toEqual([
      ['delete', 'place-1'],
      ['update', 'place-2'],
      ['update', 'place-1'],
    ])
    expect(aggregation.getAggregatedUpdates()).toHaveLength(0)
  })
})
