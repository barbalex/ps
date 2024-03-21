import { memo, useCallback, useState } from 'react'
import { Button } from '@fluentui/react-components'
import axios from 'redaxios'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import proj4 from 'proj4'

import { TextField } from '../../../components/shared/TextField'
import { useElectric } from '../../../ElectricProvider'

const notificationStyle = {
  color: 'red',
}

export const Crs = memo(({ occurrenceImport, onChange: onChangePassed }) => {
  const { project_id } = useParams()

  const [notification, setNotification] = useState()

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
    // TODO:
    // extract system and number from crs
    const system = occurrenceImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
    const number = occurrenceImport.crs?.split?.(':')?.[1]
    // get proj4 definition from https://spatialreference.org/ref/${system}/${number}/proj4.txt
    const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`
    console.log('occurrenceImport 2, onBlurCrs, proj4Url:', proj4Url)
    let resp
    try {
      resp = await axios.get(proj4Url)
    } catch (error) {
      console.error('occurrenceImport 2, onBlurCrs, resp error:', error)
      if (error.status === 404) {
        // Tell user that the crs is not found
        setNotification(
          `No definitions were found for crs '${occurrenceImport.crs}'`,
        )
      }
    }
    console.log('occurrenceImport 2, onBlurCrs, resp', resp.data)
    const defs = resp?.data
    if (!defs) return

    // For all occurrences, transform the geometry field to wgs84 using proj4 and defs
    const { result: occurrences = [] } = await db.occurrences.findMany({
      where: {
        occurrence_import_id: occurrenceImport.occurrence_import_id,
        deleted: false,
      },
    })
    console.log('occurrenceImport 2, onBlurCrs, occurrences', occurrences)
    proj4.defs([
      ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs'],
      [occurrenceImport.crs, defs],
    ])
    // build an array of objects with the occurrence_id and the transformed geometry, extracted from the geometry field
    const updates = occurrences.map((occurrence) => ({
      occurrence_id: occurrence.occurrence_id,
      geometry: proj4(occurrenceImport.crs, 'EPSG:4326', [
        occurrence.data[x_coordinate_field],
        occurrence.data[y_coordinate_field],
      ]),
    }))
  }, [
    db.occurrences,
    occurrenceImport.crs,
    occurrenceImport.occurrence_import_id,
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
        </>
      }
    />
  )
})
