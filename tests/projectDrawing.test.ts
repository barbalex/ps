import { describe, expect, it } from 'vitest'
import { createTestDb } from './helpers/createTestDb.ts'
import {
  drawingMembers,
  toProjectGeometry,
  writeProjectGeometry,
} from '../src/modules/projectDrawing.ts'

const shell = [
  [8, 47],
  [9, 47],
  [9, 48],
  [8, 48],
  [8, 47],
]
const hole = [
  [8.2, 47.2],
  [8.2, 47.4],
  [8.4, 47.4],
  [8.4, 47.2],
  [8.2, 47.2],
]
const island = [
  [10, 47],
  [11, 47],
  [11, 48],
  [10, 47],
]

describe('project area editing', () => {
  it('keeps holes and islands separate through loading, editing and clearing', () => {
    const area = toProjectGeometry([
      { type: 'Polygon', coordinates: [shell, hole] },
      { type: 'MultiPolygon', coordinates: [[island]] },
    ])
    const parts = drawingMembers(area)
    expect(parts).toEqual([
      { type: 'Polygon', coordinates: [shell, hole] },
      { type: 'Polygon', coordinates: [island] },
    ])
    expect(toProjectGeometry(parts.slice(1))).toEqual({
      type: 'MultiPolygon',
      coordinates: [[island]],
    })
    expect(toProjectGeometry([])).toBeNull()
    expect(() =>
      toProjectGeometry([...parts, { type: 'Point', coordinates: [0, 0] }]),
    ).toThrow()
  })

  it('prevents unauthorized offline writes and clears without requiring place-only columns', async () => {
    const { db, ids } = await createTestDb()
    try {
      const area = toProjectGeometry([
        { type: 'Polygon', coordinates: [shell, hole] },
      ])
      expect(
        await writeProjectGeometry(db, ids.project, ids.designer, area),
      ).toEqual({ geometry: area })
      for (const user of [ids.writer, ids.reader, ids.outsider, null]) {
        await expect(
          writeProjectGeometry(db, ids.project, user, null),
        ).rejects.toThrow()
      }
      const { rows } = await db.query(
        `SELECT ST_SRID(geometry) AS srid, ST_GeometryType(geometry) AS type FROM projects WHERE project_id = $1`,
        [ids.project],
      )
      expect(rows).toEqual([{ srid: 4326, type: 'ST_MultiPolygon' }])
      expect(
        await writeProjectGeometry(db, ids.project, ids.designer, null),
      ).toEqual({ geometry: null })
    } finally {
      await db.close()
    }
  })
})
