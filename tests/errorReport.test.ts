import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

// loads 19_errorReport.sql (the error telemetry collector) into a real
// in-memory Postgres and checks the guarantees the PostgREST endpoint
// relies on: the client payload shape inserts, id/created_at are forced
// server-side, and the field caps / kind enum reject abusive payloads.
// RLS and the role grants need a real PostgREST — covered by
// e2e/errorReport.spec.ts.
let fixture: TestFixture

beforeAll(async () => {
  fixture = await createTestDb(['19_errorReport.sql'])
})

afterAll(async () => {
  await fixture?.db.close()
})

const insert = (columns: string, values: string) =>
  fixture.db.query(`insert into error_report (${columns}) values (${values})`)

describe('error_report collector', () => {
  it('accepts an insert with the client payload shape', async () => {
    // exactly the wire format of src/modules/errorTelemetry.ts:
    // no timestamp (created_at is server-side), user_agent snake_case
    await insert(
      'release, kind, message, stack, url, user_agent',
      `'0.0.0-test', 'manual', 'boom', 'Error: boom\n    at chunk.js:1:2', '/data/Projekte', 'vitest'`,
    )

    const res = await fixture.db.query(
      `select kind, message, release from error_report limit 1`,
    )
    const row = res.rows[0] as {
      kind: string
      message: string
      release: string
    }
    expect(row.kind).toBe('manual')
    expect(row.message).toBe('boom')
    expect(row.release).toBe('0.0.0-test')
  })

  it('forces id and created_at server-side', async () => {
    await insert(
      'id, created_at, kind, message',
      `'00000000-0000-0000-0000-000000000000', '2000-01-01T00:00:00Z', 'boundary', 'x'`,
    )

    const res = await fixture.db.query(
      `select id::text, created_at::text from error_report
        where kind = 'boundary' limit 1`,
    )
    const row = res.rows[0] as { id: string; created_at: string }
    expect(row.id).not.toBe('00000000-0000-0000-0000-000000000000')
    expect(row.created_at).not.toContain('2000-01-01')
  })

  it('rejects payloads violating the message cap', async () => {
    await expect(
      insert('kind, message', `'manual', '${'a'.repeat(2001)}'`),
    ).rejects.toThrow()
  })

  it('rejects payloads violating the kind enum', async () => {
    await expect(insert('kind, message', `'made-up', 'a'`)).rejects.toThrow()
  })
})
