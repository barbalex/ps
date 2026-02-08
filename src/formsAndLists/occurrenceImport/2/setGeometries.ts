import axios from 'redaxios'
import { point, Point, featureCollection } from '@turf/helpers'
import proj4 from 'proj4'

import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'
import { addOperationAtom, store, pgliteDbAtom } from '../../../store.ts'

import type OccurrenceImports from '../../../models/public/OccurrenceImports.ts'
import type Occurrences from '../../../models/public/Occurrences.ts'

type Props = {
  occurrenceImport: OccurrenceImports
  setNotification: (msg: string) => void
}

export const setGeometries = async ({
  occurrenceImport,
  setNotification,
}: Props) => {
  const db = store.get(pgliteDbAtom)

  const system = occurrenceImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
  const number = occurrenceImport.crs?.split?.(':')?.[1]
  // get proj4 definition from https://spatialreference.org/ref/${system}/${number}/proj4.txt
  const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`
  let resp
  try {
    resp = await axios.get(proj4Url)
  } catch (error) {
    setShortTermOnlineFromFetchError(error)
    console.error('occurrenceImport 2, onBlurCrs, resp error:', error)
    if (error.status === 404) {
      // Tell user that the crs is not found
      return setNotification(
        `No definitions were found for crs '${occurrenceImport.crs}'`,
      )
    }
  }
  const defs = resp?.data
  if (!defs) return

  proj4.defs([
    ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs'],
    [occurrenceImport.crs, defs],
  ])

  // const occurrences = occurrenceImport?.occurrences ?? []
  const res = await db.query(
    `SELECT * FROM occurrences WHERE occurrence_import_id = $1 AND geometry IS NULL`,
    [occurrenceImport?.occurrence_import_id],
  )
  const occurrencesWithoutGeometry: Occurrences[] = res?.rows

  // Process in batches to allow UI updates
  const batchSize = 50
  for (let i = 0; i < occurrencesWithoutGeometry.length; i += batchSize) {
    const batch = occurrencesWithoutGeometry.slice(i, i + batchSize)

    for (const o of batch) {
      const coordinates = [
        o.data[occurrenceImport?.x_coordinate_field],
        o.data[occurrenceImport?.y_coordinate_field],
      ]
      const position = proj4(occurrenceImport.crs, 'EPSG:4326', coordinates)
      // TODO: why is reversing needed? is it a bug?
      const myPoint: Point = point(position.reverse())
      const geometry = featureCollection([myPoint])
      await db.query(
        `UPDATE occurrences SET geometry = $1 WHERE occurrence_id = $2`,
        [geometry, o.occurrence_id],
      )
      store.set(addOperationAtom, {
        table: 'occurrences',
        rowIdName: 'occurrence_id',
        rowId: o.occurrence_id,
        operation: 'update',
        draft: { geometry },
        prev: { ...o },
      })
    }

    // Small delay to allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}
