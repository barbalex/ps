import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, Input } = fluentUiReactComponents
import { useIntl } from 'react-intl'

import { FetchWmsCapabilities } from './FetchWmsCapabilities.tsx'
import { isValidUrl } from '../../../../modules/isValidUrl.ts'
import styles from './index.module.css'

export const CreateWmsService = ({ wmsLayer }) => {
  const [url, setUrl] = useState('')
  const onChange = (e) => setUrl(e.target.value)
  const { formatMessage } = useIntl()

  const [fetching, setFetching] = useState(false)
  // TODO: when fetching ends, set focus to DropdownFieldFromWmsServiceLayers

  if (wmsLayer.wms_service_id && !fetching) return null

  const urlIsInvalid = url && !isValidUrl(url)

  return (
    <div>
      <h2 className={styles.title}>{formatMessage({ id: 'Gf5HiJ', defaultMessage: 'Web Map Service (WMS) hinzufügen' })}</h2>
      <div className={styles.row}>
        <Field
          label="URL"
          value={url}
          onChange={onChange}
          validationMessage={urlIsInvalid ? formatMessage({ id: 'Hg6IjK', defaultMessage: 'Ungültige URL' }) : ''}
          validationState={urlIsInvalid ? 'warning' : 'none'}
          hint={
            urlIsInvalid ? (
              ''
            ) : url ? (
              formatMessage({ id: 'Ih7JkL', defaultMessage: 'Die Basis-URL des WMS' })
            ) : (
              <p className={styles.hintP}>
                {formatMessage({ id: 'Ji8KlM', defaultMessage: 'Basis-URL des WMS eingeben. Danach können Fähigkeiten geladen und eine Ebene ausgewählt werden.' })}
              </p>
            )
          }
          className={styles.field}
        >
          <Input
            contentAfter={
              <FetchWmsCapabilities
                wmsLayer={wmsLayer}
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
