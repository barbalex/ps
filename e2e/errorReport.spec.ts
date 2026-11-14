import { readFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import { test, expect } from '@playwright/test'

import { psql } from './helpers.ts'

/**
 * the error telemetry collector (public.error_report): the client reporter
 * (src/modules/errorTelemetry.ts, unit-tested in tests/) posts one JSON
 * object per client error. The table accepts anonymous inserts of exactly
 * that shape (capped, id/created_at forced server-side) and is readable
 * only by ps_manager. API-level checks — RLS and role grants need the real
 * PostgREST; the trigger and CHECK constraints are covered by
 * tests/errorReport.test.ts.
 *
 * Fetch-only spec (no browser): talks to PostgREST on :3002 directly.
 */

const API = 'http://localhost:3002'

const RELEASE = '0.0.0-e2e'

const post = (body: object, token?: string) =>
  fetch(`${API}/error_report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

// mint an HS256 JWT like the auth server does; PostgREST switches to the
// role claim. The dev secret comes from backend-dev/.env (local-only).
const mintToken = (role: string): string => {
  const env = readFileSync(new URL('../backend-dev/.env', import.meta.url), {
    encoding: 'utf8',
  })
  const secret = /^PGRST_JWT_SECRET=(.+)$/m.exec(env)?.[1]?.trim()
  if (!secret) throw new Error('PGRST_JWT_SECRET not found in backend-dev/.env')

  const b64url = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const header = b64url({ alg: 'HS256', typ: 'JWT' })
  const payload = b64url({ role, iat: now, exp: now + 3_600 })
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url')
  return `${header}.${payload}.${signature}`
}

test.afterAll(() => {
  psql(`delete from error_report where release = '${RELEASE}'`)
})

test('accepts an anonymous insert with the client payload shape', async () => {
  const res = await post({
    release: RELEASE,
    kind: 'manual',
    message: 'boom',
    stack: 'Error: boom\n    at chunk.js:1:2',
    url: '/data/Projekte',
    user_agent: 'e2e',
  })
  expect(res.status).toBe(201)
})

test('forces id and created_at server-side', async () => {
  const res = await post({
    id: '00000000-0000-0000-0000-000000000000',
    created_at: '2000-01-01T00:00:00Z',
    release: RELEASE,
    kind: 'boundary',
    message: 'x',
  })
  expect(res.status).toBe(201)

  const row = psql(
    `select id::text, created_at::text from error_report
      where release = '${RELEASE}' and kind = 'boundary' limit 1`,
  )
  expect(row).not.toContain('00000000-0000-0000-0000-000000000000')
  expect(row).not.toContain('2000-01-01')
})

test('rejects payloads violating the caps or the kind enum', async () => {
  const tooLong = await post({
    release: RELEASE,
    kind: 'manual',
    message: 'a'.repeat(2001),
  })
  expect(tooLong.status).toBe(400)

  const badKind = await post({
    release: RELEASE,
    kind: 'made-up',
    message: 'a',
  })
  expect(badKind.status).toBe(400)
})

test('is not readable anonymously', async () => {
  const res = await fetch(`${API}/error_report?select=id&limit=1`)
  expect(res.status).toBe(401)
  expect(await res.text()).toContain('permission denied for table error_report')
})

test('is not readable nor writable by app_user', async () => {
  const token = mintToken('app_user')

  const res = await fetch(`${API}/error_report?select=id&limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(res.status).toBe(403)

  const insert = await post({ kind: 'manual', message: 'x' }, token)
  expect(insert.status).toBe(403)
})

test('is readable by ps_manager', async () => {
  const res = await fetch(`${API}/error_report?select=kind&limit=1000`, {
    headers: { Authorization: `Bearer ${mintToken('ps_manager')}` },
  })
  expect(res.status).toBe(200)
  const rows = (await res.json()) as { kind: string }[]
  expect(rows.some((r) => r.kind === 'manual')).toBe(true)
})
