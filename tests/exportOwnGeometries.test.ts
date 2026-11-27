import { expect, it } from 'vitest'
import { createTestDb } from './helpers/createTestDb.ts'
import { exportOwnGeometries } from '../src/modules/exportOwnGeometries.ts'

it('exports only mapped list members, with raw codes, display labels and collision-safe custom columns', async () => {
  const { db, ids } = await createTestDb()
  try {
    await db.query(
      `UPDATE places SET geometry=ST_ForceCollection(ST_Point(7,46,4326)),data=$1 WHERE place_id=$2`,
      [
        JSON.stringify({
          name: 'one',
          status: 0,
          status_label: 'manual',
          NAME: 'two',
        }),
        ids.place,
      ],
    )
    await db.exec(`UPDATE subprojects SET name='Survey' WHERE subproject_id='${ids.subproject}';
      INSERT INTO lists(list_id,project_id,value_type) VALUES ('50000000-1111-4000-8000-000000000001','${ids.project}','integer');
      INSERT INTO fields(name,level,list_id,project_id,table_name) VALUES ('status',1,'50000000-1111-4000-8000-000000000001','${ids.project}','places');
      INSERT INTO list_values(list_id,value_integer) VALUES ('50000000-1111-4000-8000-000000000001',0);`)
    const blob = await exportOwnGeometries(
      db,
      'places',
      [ids.place, ids.otherPlace],
      'geojson',
      {},
    )
    const { features } = JSON.parse(await blob!.text())
    expect(features).toHaveLength(1)
    expect(features[0].properties).toMatchObject({
      place_id: ids.place,
      subproject_id: ids.subproject,
      subproject_id_label: 'Survey',
      data_NAME: 'two',
      data_name_2: 'one',
      data_status: 0,
      data_status_label: 'manual',
      data_status_label_2: '0',
    })
    expect(features[0].geometry.geometries[0].coordinates).toEqual([7, 46])
    expect(
      await exportOwnGeometries(db, 'places', [ids.otherPlace], 'geojson', {}),
    ).toBeNull()
  } finally {
    await db.close()
  }
})
