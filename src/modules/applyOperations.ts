import { store, postgrestClientAtom } from '../store.ts'
import type { QueuedOperation } from '../store.ts'
import {
  fetchPostgrestToken,
  invalidatePostgrestToken,
} from './fetchPostgrestToken.ts'

/**
 * Flushes queued operations through the server's apply_operations function
 * — one PostgREST RPC per batch instead of one CRUD request per operation.
 * The function applies the batch in order inside a single transaction with
 * per-operation subtransactions and reports a status per operation, which
 * observeOperations maps onto the same handling the per-operation path had.
 */

// rollback switch for support: set localStorage 'ps-apply-operations'='off'
// to fall back to the per-operation PostgREST path
export const applyOperationsRpcEnabled = () => {
  try {
    return localStorage.getItem('ps-apply-operations') !== 'off'
  } catch {
    return true
  }
}

// keep payloads and function round-trips bounded
export const APPLY_OPERATIONS_BATCH_SIZE = 50

export type AppliedOperation = {
  op_index: number
  status: 'applied' | 'duplicate' | 'no-row' | 'permission' | 'rejected' | 'error'
  detail: string | null
}

/** the server-visible subset of an operation (local-only fields stripped) */
const toPayload = (o: QueuedOperation) => ({
  table: o.table,
  operation: o.operation,
  rowIdName: o.rowIdName,
  rowId: o.rowId == null ? null : String(o.rowId),
  filter: o.filter ?? null,
  filters: o.filters ?? null,
  draft: o.draft ?? null,
  time: o.time,
})

/**
 * Applies a batch of operations (oldest first). Returns one result row per
 * operation, in batch order. Throws when the call itself failed (network,
 * JWT, invalid payload) — the whole batch then stays queued.
 */
export const applyOperations = async (ops: QueuedOperation[]) => {
  if (!ops.length) return [] as AppliedOperation[]

  const token = await fetchPostgrestToken()
  const postgrestClient = store.get(postgrestClientAtom)
  if (!postgrestClient) throw new Error('No PostgREST client available')

  const builder = postgrestClient.rpc('apply_operations', {
    p_operations: ops.map(toPayload),
  })
  if (token) builder.setHeader('Authorization', `Bearer ${token}`)
  const { data, error } = await builder

  if (error) {
    const isJwtError =
      error.code === 'PGRST301' ||
      error.code === 'PGRST302' ||
      error.code === '28000' ||
      error.message?.toLowerCase().includes('jwt')
    if (isJwtError) invalidatePostgrestToken()
    throw Object.assign(new Error(error.message ?? 'apply_operations failed'), {
      code: error.code,
    })
  }

  // index-aligned rows; the server omits nothing, but be defensive
  return ops.map((_, index) => {
    const row = (data as AppliedOperation[] | null)?.find(
      (r) => r.op_index === index,
    )
    return row ?? { op_index: index, status: 'error' as const, detail: 'missing result row' }
  })
}
