import { memo, useCallback, useState } from 'react'
import { Field, Input } from '@fluentui/react-components'

import { FetchWmsCapabilities } from '../FetchWmsCapabilities.tsx'
import { Wms_layers as WmsLayer } from '../../../generated/client/index.ts'

const titleStyle = { margin: 0, fontSize: '1em' }
const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
}
const hintPStyle = { margin: 0 }

type Props = {
  wmsLayer: WmsLayer
}

export const CreateWmsService = memo(({ wmsLayer }: Props) => {
  const [url, setUrl] = useState('')
  const onChange = useCallback((e) => setUrl(e.target.value), [])

  const [fetching, setFetching] = useState(false)
  // TODO: when feching ends, set focus to DropdownFieldFromWmsServiceLayers

  console.log('CreateWmsService, url:', url)

  if (wmsLayer.wms_service_id && !fetching) return null

  return (
    <div>
      <h2 style={titleStyle}>Add Web Map Service (WMS)</h2>
      <div style={rowStyle}>
        <Field
          label="URL"
          value={url}
          onChange={onChange}
          hint={
            url ? (
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
          />
        </Field>
      </div>
    </div>
  )
})
