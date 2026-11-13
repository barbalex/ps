import proj4 from 'proj4'

import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'
import { httpGet } from '../../../modules/httpGet.ts'
import {
  addOperationAtom,
  store,
  pgliteDbAtom,
  intlAtom,
} from '../../../store.ts'
import { backgroundTasks } from '../../../modules/backgroundTasks.ts'

import type ObservationImports from '../../../models/public/ObservationImports.ts'
import type Observations from '../../../models/public/Observations.ts'

type Props = {
  observationImport: ObservationImports
  setNotification: (msg: string) => void
}

// rows per bulk UPDATE: one parameterized statement via unnest instead of
// one round-trip per observation (1960 observations were 1960 sequential
// worker queries, each one invalidating the live queries)
const CHUNK_SIZE = 500

export const setGeometries = async ({
  observationImport,
  setNotification,
}: Props) => {
  const db = store.get(pgliteDbAtom)!
  const intl = store.get(intlAtom)
  const taskId = `set-geometries-${observationImport.observation_import_id}`

  const system = observationImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
  const number = observationImport.crs?.split?.(':')?.[1]
  // get proj4 definition from https://spatialreference.org/ref/${system}/${number}/proj4.txt
  const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`
  let resp
  try {
    resp = await httpGet<string>(proj4Url)
  } catch (error) {
    setShortTermOnlineFromFetchError(error)
    console.error('observationImport 2, onBlurCrs, resp error:', error)
  }
  if (resp?.status === 404) {
    // Tell user that the crs is not found
    return setNotification(
      `No definitions were found for crs '${observationImport.crs}'`,
    )
  }
  const defs = resp?.ok ? resp.data : undefined
  if (!defs) return

  proj4.defs([
    ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs'],
    [observationImport.crs as string, defs],
  ] as [string, string][])

  const res = await db.query(
    `SELECT * FROM observations WHERE observation_import_id = $1 AND geometry IS NULL`,
    [observationImport?.observation_import_id],
  )
  const observationsWithoutGeometry = res?.rows as Observations[]

  backgroundTasks.add(
    taskId,
    intl?.formatMessage({
      id: 'bgTkScr',
      defaultMessage: 'Setze Koordinaten',
    }) ?? 'Setze Koordinaten',
    observationsWithoutGeometry.length,
  )

  try {
    // project all coordinates in js first, then write them in bulk
    const updates: {
      observation_id: string
      geometry: Record<string, unknown>
    }[] = []

    for (const o of observationsWithoutGeometry) {
      const data = o.data as Record<string, unknown>
      const coordinates = [
        data[observationImport?.x_coordinate_field as string],
        data[observationImport?.y_coordinate_field as string],
      ]
      // skip rows without usable coordinates (proj4 would produce NaN
      // points from undefined/null values)
      if (
        !Number.isFinite(Number(coordinates[0])) ||
        !Number.isFinite(Number(coordinates[1]))
      ) {
        continue
      }
      const position = proj4(
        observationImport.crs as string,
        'EPSG:4326',
        coordinates as number[],
      )
      // TODO: why is reversing needed? is it a bug?
      updates.push({
        observation_id: o.observation_id,
        geometry: {
          type: 'GeometryCollection',
          geometries: [{ type: 'Point', coordinates: position.reverse() }],
        },
      })
    }

    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
      const chunk = updates.slice(i, i + CHUNK_SIZE)
      await db.query(
        `UPDATE observations AS o SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(v.geometry::text), 4326)
         FROM (SELECT * FROM unnest($1::uuid[], $2::jsonb[]) AS v(observation_id, geometry)) AS v
         WHERE o.observation_id = v.observation_id`,
        [
          chunk.map((u) => u.observation_id),
          chunk.map((u) => JSON.stringify(u.geometry)),
        ],
      )
      backgroundTasks.updateProgress(taskId, i + chunk.length)
    }

    // one queued operation instead of one per row: upsertMany updates the
    // given columns for the given ids server-side
    if (updates.length) {
      store.set(addOperationAtom, {
        table: 'observations',
        operation: 'upsertMany',
        draft: updates,
      })
    }

    backgroundTasks.complete(taskId)
  } catch (error) {
    backgroundTasks.error(taskId, (error as Error).message)
    throw error
  }
}
