import { useState } from 'react'
import { Field, Input } from '@fluentui/react-components'

import { FetchWmsCapabilities } from './FetchWmsCapabilities.tsx'
import { isValidUrl } from '../../../../modules/isValidUrl.ts'
import styles from './index.module.css'

export const CreateWmsService = ({ wmsLayer }) => {
  const [url, setUrl] = useState('')
  const onChange = (e) => setUrl(e.target.value)

  const [fetching, setFetching] = useState(false)
  // TODO: when fetching ends, set focus to DropdownFieldFromWmsServiceLayers

  if (wmsLayer.wms_service_id && !fetching) return null

  const urlIsInvalid = url && !isValidUrl(url)

  return (
    <div>
      <h2 className={styles.title}>Add Web Map Service (WMS)</h2>
      <div className={styles.row}>
        <Field
          label="URL"
          value={url}
          onChange={onChange}
          validationMessage={urlIsInvalid ? 'Invalid URL' : ''}
          validationState={urlIsInvalid ? 'warning' : 'none'}
          hint={
            urlIsInvalid ? (
              ''
            ) : url ? (
              'The base url of the WMS'
            ) : (
              <>
                <p className={styles.hintP}>Enter the base url of the WMS.</p>
                <p className={styles.hintP}>
                  Then capabilities can be loaded and a layer selected.
                </p>
              </>
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
