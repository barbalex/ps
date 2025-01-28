import axios from 'redaxios'
import { point, Point, featureCollection } from '@turf/helpers'
import proj4 from 'proj4'

export const setGeometries = async ({
  occurrenceImport,
  db,
  setNotification,
}) => {
  const system = occurrenceImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
  const number = occurrenceImport.crs?.split?.(':')?.[1]
  // get proj4 definition from https://spatialreference.org/ref/${system}/${number}/proj4.txt
  const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`
  let resp
  try {
    resp = await axios.get(proj4Url)
  } catch (error) {
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
  const occurrences = await db.occurrences.findMany({
    where: { occurrence_import_id: occurrenceImport?.occurrence_import_id },
  })
  const occurrencesWithoutGeometry = occurrences?.filter((o) => !o.geometry)
  // unfortunately, updateMany can only be used to update many with a same value
  for (const o of occurrencesWithoutGeometry) {
    const coordinates = [
      o.data[occurrenceImport?.x_coordinate_field],
      o.data[occurrenceImport?.y_coordinate_field],
    ]
    const position = proj4(occurrenceImport.crs, 'EPSG:4326', coordinates)
    // TODO: why is reversing needed? is it a bug?
    const myPoint: Point = point(position.reverse())
    const geometry = featureCollection([myPoint])
    db.occurrences.update({
      where: { occurrence_id: o.occurrence_id },
      data: { geometry },
    })
  }
}
