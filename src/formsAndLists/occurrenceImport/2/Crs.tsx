import { useState } from 'react'
import axios from 'redaxios'

import { TextField } from '../../../components/shared/TextField.tsx'

const notificationStyle = {
  color: 'red',
}

export const Crs = ({ occurrenceImport, onChange: onChangePassed }) => {
  const [notification, setNotification] = useState()

  const onChange: TextField['props']['onChange'] = (e, data) => {
    onChangePassed(e, data)
    setNotification(undefined)
  }

  const onBlurCrs = async () => {
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

    const occurrences = occurrenceImport?.occurrences ?? []

    if (!occurrences.length) {
      return setNotification('No occurrences found')
    }
    const occurrencesWithoutGeometry = occurrences.filter((o) => !o.geometry)
    if (!occurrencesWithoutGeometry.length) {
      return setNotification('All occurrences have a geometry')
    }
  }

  return (
    <>
      <TextField
        label="Coordinate reference system used in the imported data"
        name="crs"
        value={occurrenceImport.crs ?? ''}
        onChange={onChange}
        onBlur={onBlurCrs}
        validationMessage={
          <>
            <div>
              See{' '}
              <a
                href="https://epsg.org/home.html"
                target="_blank"
              >
                https://epsg.org
              </a>{' '}
              or{' '}
              <a
                href="https://spatialreference.org"
                target="_blank"
              >
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
            {notification && (
              <div style={notificationStyle}>{notification}</div>
            )}
          </>
        }
      />
    </>
  )
}
