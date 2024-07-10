import { memo, useCallback, useState } from 'react'
import { Field, Input } from '@fluentui/react-components'

import { FetchWfsCapabilities } from './FetchWfsCapabilities.tsx'
import { Vector_layers as VectorLayer } from '../../../../generated/client/index.ts'
// TODO: use this:
import { isValidUrl } from '../../../../modules/isValidUrl.ts'

const titleStyle = { margin: 0, fontSize: '1em' }
const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
}
const hintPStyle = { margin: 0 }

type Props = {
  vectorLayer: VectorLayer
}

export const CreateWfsService = memo(({ vectorLayer }: Props) => {
  const [url, setUrl] = useState('')
  const onChange = useCallback((e) => setUrl(e.target.value), [])

  const [fetching, setFetching] = useState(false)
  // TODO: when feching ends, set focus to DropdownFieldFromWmsServiceLayers

  if (vectorLayer.wfs_service_id && !fetching) return null

  return (
    <div>
      <h2 style={titleStyle}>Add Web Feature Service (WFS)</h2>
      <div style={rowStyle}>
        <Field
          label="URL"
          value={url}
          onChange={onChange}
          hint={
            url ? (
              'The base url of the WFS'
            ) : (
              <>
                <p style={hintPStyle}>Enter the base url of the WFS.</p>
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
              <FetchWfsCapabilities
                vectorLayer={vectorLayer}
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
