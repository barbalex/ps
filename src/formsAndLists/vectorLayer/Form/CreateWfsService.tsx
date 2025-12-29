import { useState } from 'react'
import { Field, Input } from '@fluentui/react-components'

import { FetchWfsCapabilities } from './FetchWfsCapabilities.tsx'
import { isValidUrl } from '../../../modules/isValidUrl.ts'
import styles from './CreateWfsService.module.css'

export const CreateWfsService = ({ vectorLayer }) => {
  const [url, setUrl] = useState('')
  const onChange = (e) => setUrl(e.target.value)

  const [fetching, setFetching] = useState(false)
  // TODO: when fetching ends, set focus to LayerDropdown

  if (vectorLayer.wfs_service_id && !fetching) return null

  const urlIsInvalid = url && !isValidUrl(url)

  return (
    <div>
      <h2 className={styles.title}>Add Web Feature Service (WFS)</h2>
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
              'The base url of the WFS'
            ) : (
              <>
                <p className={styles.hintP}>Enter the base url of the WFS.</p>
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
