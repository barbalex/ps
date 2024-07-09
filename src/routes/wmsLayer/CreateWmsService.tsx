import { memo, useCallback, useState } from 'react'
import { Button, Field, Input } from '@fluentui/react-components'

const titleStyle = { margin: 0, fontSize: '1rem' }
const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
}
const hintPStyle = { margin: 0 }

export const CreateWmsService = memo(() => {
  const [url, setUrl] = useState('')
  const onChange = useCallback((e) => setUrl(e.target.value), [])

  console.log('CreateWmsService, url:', url)

  return (
    <>
      <h2 style={titleStyle}>Create WMS Service</h2>
      <div style={rowStyle}>
        <Field
          label="URL"
          name="wms_url"
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
            contentAfter={
              <Button disabled={!url} style={{ marginRight: '-10px' }}>
                Create WMS Service
              </Button>
            }
          />
        </Field>
      </div>
    </>
  )
})
