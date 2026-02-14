import { useState } from 'react'
import { TextField } from '../../components/shared/TextField.tsx'
import { FetchWmsCapabilities } from '../wmsLayer/Form/CreateWmsService/FetchWmsCapabilities.tsx'

import '../../form.css'

export const WmsServiceForm = ({
  onChange,
  validations,
  row,
  autoFocusRef,
}) => {
  const [fetching, setFetching] = useState(false)

  // Create a wmsLayer-like object that the existing FetchWmsCapabilities expects
  const wmsLayerForFetch = {
    wms_layer_id: null, // Not needed for service-only fetch
    wms_service_id: row.wms_service_id,
    project_id: row.project_id,
  }

  return (
    <>
      <TextField
        label="URL"
        name="url"
        value={row.url ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.url?.state}
        validationMessage={validations?.url?.message}
      />
      <div style={{ marginBottom: '1rem' }}>
        <FetchWmsCapabilities
          wmsLayer={wmsLayerForFetch}
          url={row.url}
          fetching={fetching}
          setFetching={setFetching}
        />
      </div>
      <TextField
        label="Version"
        name="version"
        value={row.version ?? ''}
        readOnly
      />
      <TextField
        label="Image Format"
        name="image_format"
        value={row.image_format ?? ''}
        readOnly
      />
      <TextField
        label="Info Format"
        name="info_format"
        value={row.info_format ?? ''}
        readOnly
      />
      <TextField
        label="Default CRS"
        name="default_crs"
        value={row.default_crs ?? ''}
        readOnly
      />
    </>
  )
}
