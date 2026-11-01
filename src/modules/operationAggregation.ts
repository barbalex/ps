import { v7 as uuidv7 } from 'uuid'

import type { QueuedOperation } from '../store.ts'

// Aggregates field edits into ONE queued update operation per row and form
// session — the equivalent of vermehrung's rev aggregation.
//
// The form onChange writers update PGlite immediately (ui labels in tree and
// breadcrumbs stay live) and call addOperation per field change. Without
// aggregation each field change becomes its own server update and thus its
// own row version in the *_history tables: ten edits mean ten near-identical
// history versions, which makes edits hard to compare when solving offline
// created conflicts.
//
// addOperationAtom therefore routes aggregatable update operations here
// instead of onto the operations queue. One merged operation per row — built
// from the edits' latest values — is enqueued when the editing session ends:
// - ~5s after the last change on the row
// - when the focus leaves the form the edited field belongs to
// - on navigation
// - on tab-hide and page-close (pagehide)
//
// Durability: the buffer of unflushed edits lives in localStorage and holds
// the edit VALUES, not just row ids. A boot heal (initOperationAggregation)
// enqueues them before the ElectricSQL sync starts pulling server state, so
// unflushed edits can never be lost to a crash — and because the flush sends
// the buffered values (it never re-reads the row), a sync that applies a
// stale server version of the row in the meantime cannot destroy them: the
// flush overwrites the server row and the following sync reconciles.
//
// The write permission check stays in addOperationAtom and runs per field
// edit as before; the merged flush enqueues directly and does not re-check.
// On server rejection the merged prev (the pre-session values of the edited
// fields) is the revert target — reverting the whole session, like an
// unaggregated edit reverts its single field.

const STORAGE_KEY = 'ps-aggregated-updates'
// how long after the last field change a row is flushed
const FLUSH_DELAY_MS = 5000

// one buffered update per table/row: the edits of one form session
type AggregatedUpdate = {
  table: string
  rowIdName: string
  rowId: string | number
  /** latest value per edited field */
  draft: Record<string, unknown>
  /** pre-session value per edited field (+ audit columns) — the revert target */
  prev: Record<string, unknown>
}

/** update operations that can be buffered: single-row, draft-based writes */
export const isAggregatableUpdate = (
  op: Pick<
    QueuedOperation,
    | 'operation'
    | 'rowIdName'
    | 'rowId'
    | 'filter'
    | 'filters'
    | 'draft'
  >,
): boolean =>
  op.operation === 'update' &&
  op.rowIdName != null &&
  op.rowId != null &&
  !op.filter &&
  !op.filters &&
  !!op.draft &&
  !Array.isArray(op.draft)

// insertion order = first-edit order: flushes enqueue oldest first
const buffer = new Map<string, AggregatedUpdate>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

// set by initOperationAggregation (store.ts); pushes flushed operations onto
// the operations queue. Injected so this module never imports store.ts
// (store.ts imports this module — the cycle is avoided, see revertOperationInPlace)
let enqueueOperations: ((ops: QueuedOperation[]) => void) | null = null

const persist = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...buffer.values()]))
  } catch {
    // private mode, disabled storage or no window (tests): flushes still
    // work, only the crash heal degrades
  }
}

const loadPersisted = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    for (const entry of JSON.parse(raw) as AggregatedUpdate[]) {
      buffer.set(`${entry.table}/${entry.rowId}`, entry)
    }
  } catch {
    // unreadable storage: start empty, the queue itself is unaffected
  }
}

const clearRow = (key: string) => {
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.delete(key)
  buffer.delete(key)
}

export const hasAggregatedUpdates = () => buffer.size > 0

// the aggregated equivalent of queueing each field edit as its own operation.
// Flushes the given rows (defaults to all); entry order is first-edit order.
const flushRows = (keys?: string[]): QueuedOperation[] => {
  const toFlush = (keys ?? [...buffer.keys()]).filter((key) => buffer.has(key))
  if (!toFlush.length) return []
  const entries = toFlush.map((key) => buffer.get(key)!)
  for (const key of toFlush) clearRow(key)
  persist()
  const time = new Date().toISOString()
  // id/time are assigned here: the queue treats the flush as one write
  const operations = entries.map((entry) => ({
    id: uuidv7(),
    time,
    table: entry.table,
    rowIdName: entry.rowIdName,
    rowId: entry.rowId,
    operation: 'update' as const,
    draft: entry.draft,
    prev: entry.prev,
  }))
  enqueueOperations?.(operations)
  return operations
}

// exposed for tests
export const getAggregatedUpdates = () =>
  JSON.parse(JSON.stringify([...buffer.values()])) as AggregatedUpdate[]

/** flushes every buffered row (session end, boot heal, queue-order guard) */
export const flushAggregatedUpdates = () => flushRows()

/** buffers one field edit (already applied to PGlite) for a later merged flush */
export const registerAggregatedUpdate = (
  op: Pick<
    QueuedOperation,
    'table' | 'rowIdName' | 'rowId' | 'draft' | 'prev'
  >,
) => {
  const key = `${op.table}/${op.rowId}`
  const draft = op.draft as Record<string, unknown>
  const existing = buffer.get(key)
  if (existing) {
    for (const field of Object.keys(draft)) {
      // the first edit of a field carries its pre-session value
      if (!(field in existing.draft)) {
        existing.prev[field] = (op.prev as Record<string, unknown>)?.[field]
      }
      existing.draft[field] = draft[field]
    }
  } else {
    const prev: Record<string, unknown> = {}
    const opPrev = (op.prev ?? {}) as Record<string, unknown>
    for (const field of Object.keys(draft)) {
      prev[field] = opPrev[field]
    }
    // revertOperation restores the audit columns from prev
    if (opPrev.updated_at != null) prev.updated_at = opPrev.updated_at
    if (opPrev.updated_by != null) prev.updated_by = opPrev.updated_by
    buffer.set(key, {
      table: op.table,
      rowIdName: op.rowIdName!,
      rowId: op.rowId!,
      draft: { ...draft },
      prev,
    })
  }
  persist()

  // one debounce per row: only this row's session ends when it fires
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key)
      flushRows([key])
    }, FLUSH_DELAY_MS),
  )
}

// the region a form's fields live in: leaving it ends the editing session
const FORM_SELECTOR =
  '.form-outer-container, .form-container, .form-container-embedded'

const handleFocusout = (event: FocusEvent) => {
  if (!buffer.size) return
  const form = (event.target as HTMLElement | null)?.closest?.(FORM_SELECTOR)
  if (!form) return
  const to = event.relatedTarget as HTMLElement | null
  // focus vanished (click on non-focusable space, window blur):
  // whether the session ended is unknowable — the debounce decides
  if (!to) return
  // still inside the same form
  if (form.contains(to)) return
  // dropdowns, date pickers and dialogs of form controls render into
  // portals outside the form dom — focus there does not leave the session
  if (to.closest?.('[data-portal-node]')) return
  flushAggregatedUpdates()
}

let initialized = false

/**
 * Wires the aggregation up. Call once when the store module loads.
 * Enqueues buffered edits left over from a previous session (crash, closed
 * tab) before the sync starts pulling server state, and registers the flush
 * triggers that end an editing session.
 */
export const initOperationAggregation = ({
  enqueue,
}: {
  enqueue: (ops: QueuedOperation[]) => void
}) => {
  enqueueOperations = enqueue
  if (initialized) return
  initialized = true

  // boot heal
  loadPersisted()
  flushAggregatedUpdates()

  if (typeof document !== 'undefined') {
    document.addEventListener('focusout', handleFocusout, true)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushAggregatedUpdates()
    })
  }
  if (typeof window !== 'undefined') {
    // fires after the page is closed or navigated away; unlike unload
    // handlers it allows the synchronous localStorage write of the flush
    window.addEventListener('pagehide', () => {
      flushAggregatedUpdates()
    })
  }
}

/** drops all buffered edits (e.g. when local data is cleared on logout) */
export const clearAggregatedUpdates = () => {
  for (const key of [...buffer.keys()]) clearRow(key)
  persist()
}

// reset the module state between tests
export const __resetOperationAggregationForTests = () => {
  clearAggregatedUpdates()
  initialized = false
  enqueueOperations = null
}
