import { useState } from 'react'
import axios from 'redaxios'

import { TextField } from '../../../components/shared/TextField.tsx'
import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'
import styles from './Crs.module.css'

export const Crs = ({
  observationImport,
  onChange: onChangePassed,
  validations,
}) => {
  const [notification, setNotification] = useState()

  const onChange: TextField['props']['onChange'] = (e, data) => {
    onChangePassed(e, data)
    setNotification(undefined)
  }

  const onBlurCrs = async () => {
    if (!observationImport?.crs) return

    // extract system and number from crs
    const system = observationImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
    const number = observationImport.crs?.split?.(':')?.[1]
    // get proj4 definition from https://spatialreference.org/ref/${system}/${number}/proj4.txt
    const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`
    let resp
    try {
      resp = await axios.get(proj4Url)
    } catch (error) {
      setShortTermOnlineFromFetchError(error)
      console.error('observationImport 2, onBlurCrs, resp error:', error)
      if (error.status === 404) {
        // Tell user that the crs is not found
        return setNotification(
          `No definitions were found for crs '${observationImport.crs}'`,
        )
      }
    }
    const defs = resp?.data
    if (!defs) return

    const occurrences = observationImport?.occurrences ?? []

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
        value={observationImport.crs ?? ''}
        onChange={onChange}
        onBlur={onBlurCrs}
        validationState={validations?.crs?.state}
        validationMessage={
          validations?.crs?.message ?? (
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
              {notification && (
                <div className={styles.notification}>{notification}</div>
              )}
            </>
          )
        }
      />
    </>
  )
}
