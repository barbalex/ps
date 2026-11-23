import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import {
  effectiveOfflineFilesSql,
  planReconcile,
  urlsOfOfflineFile,
  uuidFromUrl,
  offlinePreviewUrl,
  offlineThumbUrl,
  OFFLINE_FILE_MAX_SIZE,
} from '../src/modules/offlineFiles.ts'
import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

let fixture: TestFixture

const uuid = (n: number) => `00000000-0000-7000-8000-${String(n).padStart(12, '0')}`
const cdnUrl = (n: number) => `https://ucarecdn.com/${uuid(n)}/`

beforeAll(async () => {
  fixture = await createTestDb()
  const { project, subproject, place, action } = fixture.ids

  // the fixture project's level config: level 1 marks places' and actions'
  // files offline, level 2 marks nothing
  await fixture.db.exec(`
    INSERT INTO place_levels (place_level_id, project_id, level, place_files_offline, action_files_offline) VALUES
      ('${uuid(1001)}', '${project}', 1, TRUE, TRUE),
      ('${uuid(1002)}', '${project}', 2, FALSE, FALSE);

    INSERT INTO places (place_id, subproject_id, parent_id, level) VALUES
      ('${uuid(1101)}', '${subproject}', '${place}', 2);

    INSERT INTO actions (action_id, place_id) VALUES
      ('${uuid(1201)}', '${uuid(1101)}');

    INSERT INTO checks (check_id, place_id) VALUES
      ('${uuid(1301)}', '${place}');

    -- inserted while the gate is still off: nothing may come back yet
    INSERT INTO files (file_id, project_id, place_id, url, uuid, size, offline)
      VALUES ('${uuid(2001)}', '${project}', '${place}', '${cdnUrl(2001)}', '${uuid(2001)}', 1000, FALSE);
    INSERT INTO files (file_id, project_id, action_id, url, uuid, size, offline)
      VALUES ('${uuid(2002)}', '${project}', '${action}', '${cdnUrl(2002)}', '${uuid(2002)}', 1000, FALSE);
    INSERT INTO files (file_id, project_id, place_id, url, uuid, size, offline)
      VALUES ('${uuid(2003)}', '${project}', '${place}', '${cdnUrl(2003)}', '${uuid(2003)}', 1000, TRUE);
  `)

  await fixture.db.exec(`
    -- gate on: now the table flags and marks take effect
    UPDATE projects SET files_offline = TRUE WHERE project_id = '${project}';

    -- level-1 place: covered by the place flag
    INSERT INTO files (file_id, project_id, place_id, url, uuid, size, offline)
      VALUES ('${uuid(2004)}', '${project}', '${place}', '${cdnUrl(2004)}', '${uuid(2004)}', 1000, FALSE);
    -- level-2 place: table flag false, not marked → not offline
    INSERT INTO files (file_id, project_id, place_id, url, uuid, size, offline)
      VALUES ('${uuid(2005)}', '${project}', '${uuid(1101)}', '${cdnUrl(2005)}', '${uuid(2005)}', 1000, FALSE);
    -- level-2 place: not covered by the table flag but marked → offline
    INSERT INTO files (file_id, project_id, place_id, url, uuid, size, offline)
      VALUES ('${uuid(2006)}', '${project}', '${uuid(1101)}', '${cdnUrl(2006)}', '${uuid(2006)}', 1000, TRUE);
    -- action on a level-2 place: action flag false there → not offline
    INSERT INTO files (file_id, project_id, action_id, url, uuid, size, offline)
      VALUES ('${uuid(2007)}', '${project}', '${uuid(1201)}', '${cdnUrl(2007)}', '${uuid(2007)}', 1000, FALSE);
    -- check: check flag off on level 1, not marked → not offline
    INSERT INTO files (file_id, project_id, check_id, url, uuid, size, offline)
      VALUES ('${uuid(2008)}', '${project}', '${uuid(1301)}', '${cdnUrl(2008)}', '${uuid(2008)}', 1000, FALSE);
    -- directly on the subproject: only the mark applies
    INSERT INTO files (file_id, project_id, subproject_id, url, uuid, size, offline)
      VALUES ('${uuid(2009)}', '${project}', '${subproject}', '${cdnUrl(2009)}', '${uuid(2009)}', 1000, FALSE);
    INSERT INTO files (file_id, project_id, subproject_id, url, uuid, size, offline)
      VALUES ('${uuid(2010)}', '${project}', '${subproject}', '${cdnUrl(2010)}', '${uuid(2010)}', 1000, TRUE);
    -- too large
    INSERT INTO files (file_id, project_id, place_id, url, uuid, size, offline)
      VALUES ('${uuid(2011)}', '${project}', '${place}', '${cdnUrl(2011)}', '${uuid(2011)}', ${OFFLINE_FILE_MAX_SIZE + 1}, FALSE);
    -- no url (never uploaded): comes back but must show as no-url
    INSERT INTO files (file_id, project_id, place_id, size, offline)
      VALUES ('${uuid(2012)}', '${project}', '${place}', 1000, FALSE);
  `)
})

afterAll(async () => {
  await fixture?.db.close()
})

const effectiveIds = async () => {
  const res = await fixture.db.query<{ file_id: string }>(
    effectiveOfflineFilesSql,
  )
  return res.rows.map((row) => row.file_id).sort()
}

describe('effectiveOfflineFilesSql', () => {
  it('returns nothing while the project gate is off (even marked files)', async () => {
    await fixture.db.exec(
      `UPDATE projects SET files_offline = FALSE WHERE project_id = '${fixture.ids.project}'`,
    )
    expect(await effectiveIds()).toEqual([])
  })

  it('covers table flags via place and action levels and single marks', async () => {
    await fixture.db.exec(
      `UPDATE projects SET files_offline = TRUE WHERE project_id = '${fixture.ids.project}'`,
    )
    const ids = await effectiveIds()
    expect(ids).toEqual([
      uuid(2001), // level-1 place flag on
      uuid(2002), // level-1 action flag on
      uuid(2003), // marked
      uuid(2004), // level-1 place flag on
      uuid(2006), // level-2 place, marked
      uuid(2010), // subproject, marked
      uuid(2011), // level-1 place flag on (too-large is a UI concern)
      uuid(2012), // level-1 place flag on (no-url is a UI concern)
    ])
  })
})

describe('planReconcile', () => {
  const file = (n: number, size = 1000) => ({
    file_id: uuid(n),
    uuid: uuid(n),
    url: cdnUrl(n),
    size,
    mimetype: 'image/png',
  })

  it('plans downloads for missing urls and deletions for orphaned cache entries', () => {
    const rows = [file(3001), file(3002, OFFLINE_FILE_MAX_SIZE + 1)]
    const cachedUrls = [
      cdnUrl(3003),
      ...urlsOfOfflineFile(cdnUrl(3004), 'image/png'),
    ]

    const plan = planReconcile(rows, cachedUrls, true)
    expect(plan.statuses[uuid(3001)]).toBe('downloading')
    expect(plan.statuses[uuid(3002)]).toBe('too-large')
    expect(plan.toDownload).toEqual([
      { fileId: uuid(3001), urls: urlsOfOfflineFile(cdnUrl(3001), 'image/png') },
    ])
    // entries of files that are no longer (or never were) effective
    expect(plan.toDelete).toEqual([
      cdnUrl(3003),
      ...urlsOfOfflineFile(cdnUrl(3004), 'image/png'),
    ])
  })

  it('queues downloads while offline and reports files without url', () => {
    const plan = planReconcile(
      [
        {
          file_id: uuid(3001),
          uuid: uuid(3001),
          url: null,
          size: null,
          mimetype: null,
        },
        file(3002),
      ],
      [],
      false,
    )
    expect(plan.statuses[uuid(3001)]).toBe('no-url')
    expect(plan.statuses[uuid(3002)]).toBe('queued')
    expect(plan.toDownload).toEqual([])
    expect(plan.toDelete).toEqual([])
  })

  it('marks fully cached files as cached', () => {
    const plan = planReconcile(
      [file(3001)],
      urlsOfOfflineFile(cdnUrl(3001), 'image/png'),
      true,
    )
    expect(plan.statuses[uuid(3001)]).toBe('cached')
    expect(plan.toDownload).toEqual([])
  })

  it('caches only the plain url for non-image files and caches them without transforms', () => {
    const textFile = { ...file(3005), mimetype: 'text/plain' }
    // image transforms 400 on Uploadcare for text files — they must not be
    // planned, or the file's status could never reach cached
    expect(urlsOfOfflineFile(textFile.url, textFile.mimetype)).toEqual([
      cdnUrl(3005),
    ])

    const plan = planReconcile([textFile], [cdnUrl(3005)], true)
    expect(plan.statuses[uuid(3005)]).toBe('cached')
    expect(plan.toDownload).toEqual([])
  })
})

describe('url helpers', () => {
  it('builds the fixed thumbnail and preview transforms', () => {
    expect(offlineThumbUrl(cdnUrl(1))).toBe(
      `${cdnUrl(1)}-/resize/x50/-/format/auto/-/quality/smart/`,
    )
    expect(offlinePreviewUrl(cdnUrl(1))).toBe(
      `${cdnUrl(1)}-/preview/1600x1600/-/format/auto/-/quality/smart/`,
    )
    expect(urlsOfOfflineFile(cdnUrl(1), 'image/jpeg')).toEqual([
      offlineThumbUrl(cdnUrl(1)),
      offlinePreviewUrl(cdnUrl(1)),
      cdnUrl(1),
    ])
  })

  it('parses the uploadcare uuid from both cdn domains', () => {
    expect(uuidFromUrl(cdnUrl(1))).toBe(uuid(1))
    expect(uuidFromUrl(`${cdnUrl(1)}-/resize/x50/`)).toBe(uuid(1))
    expect(
      uuidFromUrl(`https://4ctwp64477.ucarecd.net/${uuid(2)}/-/preview/2x2/`),
    ).toBe(uuid(2))
    expect(uuidFromUrl('https://example.com/x')).toBeNull()
  })
})
