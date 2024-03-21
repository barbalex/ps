import { memo, useCallback, useState } from 'react'
import { Button } from '@fluentui/react-components'
import axios from 'redaxios'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

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
    console.log('occurrenceImport 2, onBlurCrs, crs:', occurrenceImport.crs)
    // TODO:
    // extract system and number from crs
    const system = occurrenceImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
    const number = occurrenceImport.crs?.split?.(':')?.[1]
    console.log('occurrenceImport 2, onBlurCrs', { system, number })
    // get proj4 definition from https://spatialreference.org/ref/${system}/${number}/proj4.txt
    const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`
    console.log('occurrenceImport 2, onBlurCrs, proj4Url:', proj4Url)
    let resp
    try {
      resp = await axios.get(proj4Url)
    } catch (error) {
      console.error(
        'occurrenceImport 2, onBlurCrs, proj4 error status:',
        error.status,
      )
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
  }, [occurrenceImport.crs])

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
