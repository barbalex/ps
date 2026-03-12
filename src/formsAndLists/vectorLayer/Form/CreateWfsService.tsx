import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, Input } = fluentUiReactComponents
import { useIntl } from 'react-intl'

import { FetchWfsCapabilities } from './FetchWfsCapabilities.tsx'
import { isValidUrl } from '../../../modules/isValidUrl.ts'
import styles from './CreateWfsService.module.css'

export const CreateWfsService = ({ vectorLayer }) => {
  const [url, setUrl] = useState('')
  const onChange = (e) => setUrl(e.target.value)
  const [fetching, setFetching] = useState(false)
  const { formatMessage } = useIntl()
  // TODO: when fetching ends, set focus to LayerDropdown

  if (vectorLayer.wfs_service_id && !fetching) return null

  const urlIsInvalid = url && !isValidUrl(url)

  return (
    <div>
      <h2 className={styles.title}>
        {formatMessage({
          id: 'Gl5HjM',
          defaultMessage: 'Web Feature Service (WFS) hinzufügen',
        })}
      </h2>
      <div className={styles.row}>
        <Field
          label={formatMessage({ id: 'Yb8ZcE', defaultMessage: 'URL' })}
          value={url}
          onChange={onChange}
          validationMessage={
            urlIsInvalid
              ? formatMessage({ id: 'Zc9AdF', defaultMessage: 'Ungültige URL' })
              : ''
          }
          validationState={urlIsInvalid ? 'warning' : 'none'}
          hint={
            urlIsInvalid ? (
              ''
            ) : url ? (
              formatMessage({
                id: 'Ad0BeG',
                defaultMessage: 'Die Basis-URL des WFS',
              })
            ) : (
              <>
                <p className={styles.hintP}>
                  {formatMessage({
                    id: 'Be1CfH',
                    defaultMessage: 'Die Basis-URL des WFS eingeben.',
                  })}
                </p>
                <p className={styles.hintP}>
                  {formatMessage({
                    id: 'Cf2DgI',
                    defaultMessage:
                      'Dann können Fähigkeiten geladen und eine Ebene ausgewählt werden.',
                  })}
                </p>
              </>
            )
          }
          className={styles.field}
        >
          <Input
            contentAfter={
              <FetchWfsCapabilities
                vectorLayer={vectorLayer}
                url={url}
                fetching={fetching}
                setFetching={setFetching}
              />
            }
            appearance="underline"
            autoFocus={true}
          />
        </Field>
      </div>
    </div>
  )
}
