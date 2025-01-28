import { memo, useCallback, useState } from 'react'
import { Field, Input } from '@fluentui/react-components'

import { FetchWmsCapabilities } from './FetchWmsCapabilities.tsx'
import { isValidUrl } from '../../../../modules/isValidUrl.ts'

const titleStyle = { margin: 0, fontSize: '1em' }
const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
}
const hintPStyle = { margin: 0 }

export const CreateWmsService = memo(({ wmsLayer }) => {
  const [url, setUrl] = useState('')
  const onChange = useCallback((e) => setUrl(e.target.value), [])

  const [fetching, setFetching] = useState(false)
  // TODO: when fetching ends, set focus to DropdownFieldFromWmsServiceLayers

  if (wmsLayer.wms_service_id && !fetching) return null

  const urlIsInvalid = url && !isValidUrl(url)

  return (
    <div>
      <h2 style={titleStyle}>Add Web Map Service (WMS)</h2>
      <div style={rowStyle}>
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
                <p style={hintPStyle}>Enter the base url of the WMS.</p>
                <p style={hintPStyle}>
                  Then capabilities can be loaded and a layer selected.
                </p>
              </>
            )
          }
          style={{ flexGrow: 1 }}
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
})
