import { memo, useCallback, useState } from 'react'
import axios from 'redaxios'
import proj4 from 'proj4'
import { point, Point } from '@turf/helpers'

import { TextField } from '../../../components/shared/TextField'
import { useElectric } from '../../../ElectricProvider'

const notificationStyle = {
  color: 'red',
}
const transformCountStyle = {
  color: 'orange',
}

export const Crs = memo(({ occurrenceImport, onChange: onChangePassed }) => {
  const [notification, setNotification] = useState()
  const [transformCount, setTransformCount] = useState(0)

  const { db } = useElectric()!

  const onChange: TextField['props']['onChange'] = useCallback(
    (e, data) => {
      onChangePassed(e, data)
      setNotification(undefined)
    },
    [onChangePassed],
  )

  const onBlurCrs = useCallback(async () => {
    if (!occurrenceImport?.crs) return

    // extract system and number from crs
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

    // For all occurrences, transform the geometry field to wgs84 using proj4 and defs
    const { result: occurrences = [] } = await db.occurrences.findMany({
      where: {
        occurrence_import_id: occurrenceImport.occurrence_import_id,
      },
    })

    if (!occurrences.length) {
      return setNotification('No occurrences found')
    }
    const occurrencesWithoutGeometry = occurrences.filter((o) => !o.geometry)
    if (!occurrencesWithoutGeometry.length) {
      return setNotification('All occurrences already have a geometry')
    }

    proj4.defs([
      ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs'],
      [occurrenceImport.crs, defs],
    ])
    // build an array of objects with the occurrence_id and the transformed geometry, extracted from the geometry field
    // const fakeOccurrences = [
    //   {
    //     occurrence_id: 'fake-occurrence-id',
    //     data: {
    //       x: 2714988,
    //       y: 1209007,
    //     },
    //   },
    // ]
    // unfortunately, updateMany can only be used to update many with a same value
    // TODO: replace fake with real and test
    for (const o of occurrencesWithoutGeometry) {
      const coordinates = [
        o.data[occurrenceImport?.x_coordinate_field ?? 'x'],
        o.data[occurrenceImport?.y_coordinate_field ?? 'y'],
      ]
      const position = proj4(occurrenceImport.crs, 'EPSG:4326', coordinates)
      // console.log('occurrenceImport 2, onBlurCrs, position', position)
      // TODO: why is reversing needed? is it a bug?
      const geometry: Point = point(position.reverse())
      // console.log('occurrenceImport 2, onBlurCrs, geometry', geometry)
      await db.occurrences.update({
        where: { occurrence_id: o.occurrence_id },
        data: { geometry },
      })
      setTransformCount((c) => c + 1)
    }
  }, [
    db.occurrences,
    occurrenceImport.crs,
    occurrenceImport.occurrence_import_id,
    occurrenceImport?.x_coordinate_field,
    occurrenceImport?.y_coordinate_field,
  ])

  if (!occurrenceImport) {
    return <div>Loading...</div>
  }

  // TODO:
  // - if geojson_geometry_field and crs choosen while geometry fields are empty,
  //   copy that fields values to geometry field in all occurrences while transforming the crs to wgs84 using proj4

  return (
    <TextField
      label="Coordinate Reference System"
      name="crs"
      value={occurrenceImport.crs ?? ''}
      onChange={onChange}
      onBlur={onBlurCrs}
      validationMessage={
        <>
          <div>
            See{' '}
            <a href="https://epsg.org/home.html" target="_blank">
              https://epsg.org
            </a>{' '}
            or{' '}
            <a href="https://spatialreference.org" target="_blank">
              https://spatialreference.org
            </a>{' '}
            for a list of EPSG codes and their descriptions.
          </div>
          <div>
            A valid example is: 'EPSG:2056',{' '}
            <a
              href="https://spatialreference.org/ref/epsg/2056/"
              target="_blank"
            >
              the reference system
            </a>{' '}
            used in Switzerland.
          </div>
          {notification && <div style={notificationStyle}>{notification}</div>}
          {transformCount > 0 && (
            <div
              style={transformCountStyle}
            >{`Transforming ${transformCount} occurrences`}</div>
          )}
        </>
      }
    />
  )
})
