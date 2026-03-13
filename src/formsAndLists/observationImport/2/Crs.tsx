import { useState } from 'react'
import axios from 'redaxios'
import { useIntl } from 'react-intl'

import { TextField } from '../../../components/shared/TextField.tsx'
import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'
import styles from './Crs.module.css'

export const Crs = ({
  observationImport,
  onChange: onChangePassed,
  validations,
}) => {
  const [notification, setNotification] = useState()
  const { formatMessage } = useIntl()

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
          formatMessage(
            {
              id: 'cRsNfd',
              defaultMessage:
                "Keine Definitionen für das Koordinaten-Bezugs-System '{crs}' gefunden",
            },
            { crs: observationImport.crs },
          ),
        )
      }
    }
    const defs = resp?.data
    if (!defs) return

    const observations = observationImport?.observations ?? []

    if (!observations.length) {
      return setNotification(
        formatMessage({
          id: 'cRsNoO',
          defaultMessage: 'Keine Beobachtungen gefunden',
        }),
      )
    }
    const observationsWithoutGeometry = observations.filter((o) => !o.geometry)
    if (!observationsWithoutGeometry.length) {
      return setNotification(
        formatMessage({
          id: 'cRsAlG',
          defaultMessage: 'Alle Beobachtungen haben eine Geometrie',
        }),
      )
    }
  }

  return (
    <>
      <TextField
        label={formatMessage({
          id: 'cRsLbl',
          defaultMessage:
            'Im importierten Datensatz verwendetes Koordinaten-Bezugs-System',
        })}
        name="crs"
        value={observationImport.crs ?? ''}
        onChange={onChange}
        onBlur={onBlurCrs}
        validationState={validations?.crs?.state}
        validationMessage={
          validations?.crs?.message ?? (
            <>
              <div>
                {formatMessage({ id: 'cRsSee', defaultMessage: 'Siehe' })}{' '}
                <a href="https://epsg.org/home.html" target="_blank">
                  https://epsg.org
                </a>{' '}
                {formatMessage({ id: 'cRsOrL', defaultMessage: 'oder' })}{' '}
                <a href="https://spatialreference.org" target="_blank">
                  https://spatialreference.org
                </a>{' '}
                {formatMessage({
                  id: 'cRsFrL',
                  defaultMessage:
                    'für eine Liste von EPSG-Codes und deren Beschreibungen.',
                })}
              </div>
              <div>
                {formatMessage({
                  id: 'cRsExm',
                  defaultMessage: 'Ein gültiges Beispiel ist:',
                })}{' '}
                <a
                  href="https://spatialreference.org/ref/epsg/2056/"
                  target="_blank"
                >
                  {formatMessage({
                    id: 'cRsRef',
                    defaultMessage: "'EPSG:2056',",
                  })}
                </a>{' '}
                {formatMessage({
                  id: 'cRsUsS',
                  defaultMessage: 'das in der Schweiz verwendet wird.',
                })}
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
