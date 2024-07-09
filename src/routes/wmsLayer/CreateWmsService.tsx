import { memo, useCallback, useState } from 'react'
import { Field, Input } from '@fluentui/react-components'

import { FetchCapabilities } from './FetchCapabilities.tsx'
import { Wms_layers as WmsLayer } from '../../../generated/client/index.ts'

const titleStyle = { margin: 0, fontSize: '1rem' }
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

  console.log('CreateWmsService, url:', url)

  return (
    <>
      <h2 style={titleStyle}>Create WMS Service</h2>
      <div style={rowStyle}>
        <Field
          label="URL"
          value={url}
          onChange={onChange}
          autoFocus={false}
          hint={
            url ? (
              'The base url of the service providing the WMS'
            ) : (
              <>
                <p style={hintPStyle}>
                  Enter the base url of the service providing the WMS.
                </p>
                <p style={hintPStyle}>
                  Then capabilities can be loaded and a layer selected.
                </p>
              </>
            )
          }
          style={{ flexGrow: 1 }}
        >
          <Input
            contentAfter={<FetchCapabilities wmsLayer={wmsLayer} url={url} />}
            appearance="underline"
          />
        </Field>
      </div>
    </>
  )
})
