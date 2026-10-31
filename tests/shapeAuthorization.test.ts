import { describe, expect, it } from 'vitest'

import {
  authorizeShapeRequest,
  shapeDefinitions,
} from '../backend/auth/shapeDefinitions.mjs'

const userId = '11111111-1111-4111-8111-111111111111'
const otherUserId = '22222222-2222-4222-8222-222222222222'

// builds the query string the way @electric-sql/client does
const shapeUri = ({
  table,
  where,
  params,
  columns,
  extra = '',
}: {
  table: string
  where?: string
  params?: Record<string, string>
  columns?: string[]
  extra?: string
}) => {
  const query = new URLSearchParams()
  query.set('table', table)
  if (where !== undefined) query.set('where', where)
  for (const [key, value] of Object.entries(params ?? {})) {
    query.set(`params[${key}]`, value)
  }
  if (columns) query.set('columns', columns.map((c) => `"${c}"`).join(','))
  query.set('offset', '-1')
  return `/v1/shape?${query.toString()}${extra}`
}

const canonical = (table: string, columns?: string[]) => {
  const definition = shapeDefinitions[table]!
  return shapeUri({
    table,
    where: definition.where,
    params: definition.where ? { '1': userId } : undefined,
    columns: columns ?? definition.columns,
  })
}

describe('authorizeShapeRequest', () => {
  it('accepts every shape definition as the client sends it', () => {
    for (const table of Object.keys(shapeDefinitions)) {
      const result = authorizeShapeRequest({
        method: 'GET',
        forwardedUri: canonical(table),
        userId,
      })
      expect(result, table).toEqual({ ok: true })
    }
  })

  it('accepts resumed requests carrying handle/live/cursor', () => {
    const result = authorizeShapeRequest({
      method: 'GET',
      forwardedUri:
        canonical('projects') + '&handle=123-456&live=true&cursor=42',
      userId,
    })
    expect(result).toEqual({ ok: true })
  })

  it('rejects a where parameter bound to another user', () => {
    const result = authorizeShapeRequest({
      method: 'GET',
      forwardedUri: shapeUri({
        table: 'projects',
        where: shapeDefinitions.projects!.where,
        params: { '1': otherUserId },
      }),
      userId,
    })
    expect(result.ok).toBe(false)
  })

  it('rejects a missing or widened where clause', () => {
    expect(
      authorizeShapeRequest({
        method: 'GET',
        forwardedUri: shapeUri({ table: 'projects' }),
        userId,
      }).ok,
    ).toBe(false)
    expect(
      authorizeShapeRequest({
        method: 'GET',
        forwardedUri: shapeUri({
          table: 'projects',
          where: `${shapeDefinitions.projects!.where} OR true`,
          params: { '1': userId },
        }),
        userId,
      }).ok,
    ).toBe(false)
  })

  it('rejects extra positional params', () => {
    const result = authorizeShapeRequest({
      method: 'GET',
      forwardedUri: shapeUri({
        table: 'projects',
        where: shapeDefinitions.projects!.where,
        params: { '1': userId, '2': otherUserId },
      }),
      userId,
    })
    expect(result.ok).toBe(false)
  })

  it('rejects a where clause on tables synced without one', () => {
    const result = authorizeShapeRequest({
      method: 'GET',
      forwardedUri: shapeUri({
        table: 'messages',
        where: 'true',
        params: { '1': userId },
      }),
      userId,
    })
    expect(result.ok).toBe(false)
  })

  it('rejects tables outside the shape definitions', () => {
    for (const table of ['auth_verifications', 'users_history', 'pg_shadow']) {
      expect(
        authorizeShapeRequest({
          method: 'GET',
          forwardedUri: shapeUri({ table }),
          userId,
        }).ok,
        table,
      ).toBe(false)
    }
  })

  it('rejects columns outside the definition, accepts subsets', () => {
    expect(
      authorizeShapeRequest({
        method: 'GET',
        forwardedUri: canonical('users', ['user_id', 'email']),
        userId,
      }),
    ).toEqual({ ok: true })
    expect(
      authorizeShapeRequest({
        method: 'GET',
        forwardedUri: canonical('users', ['user_id', 'two_factor_secret']),
        userId,
      }).ok,
    ).toBe(false)
  })

  it('rejects non-GET methods and other paths', () => {
    expect(
      authorizeShapeRequest({
        method: 'DELETE',
        forwardedUri: canonical('projects'),
        userId,
      }).ok,
    ).toBe(false)
    expect(
      authorizeShapeRequest({
        method: 'GET',
        forwardedUri: '/v1/health',
        userId,
      }).ok,
    ).toBe(false)
    expect(
      authorizeShapeRequest({ method: 'GET', forwardedUri: '', userId }).ok,
    ).toBe(false)
  })
})
