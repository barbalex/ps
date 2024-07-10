import { memo, useCallback, useState } from 'react'
import { Field, Input } from '@fluentui/react-components'

import { FetchWfsCapabilities } from './FetchWfsCapabilities.tsx'
import { Vector_layers as VectorLayer } from '../../../../generated/client/index.ts'

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

  console.log('CreateWfsService, url:', url)

  return (
    <div>
      <h2 style={titleStyle}>Add Web Feature Service (WFS)</h2>
      <div style={rowStyle}>
        <Field
          label="URL"
          value={url}
          onChange={onChange}
          autoFocus={false}
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
              <FetchWfsCapabilities vectorLayer={vectorLayer} url={url} />
            }
            appearance="underline"
          />
        </Field>
      </div>
    </div>
  )
})
