import { useState } from 'react'
import { TextField } from '../../components/shared/TextField.tsx'
import { FetchWfsCapabilities } from '../vectorLayer/Form/FetchWfsCapabilities.tsx'

import '../../form.css'

export const WfsServiceForm = ({
  onChange,
  validations,
  row,
  autoFocusRef,
}) => {
  const [fetching, setFetching] = useState(false)

  // Create a vectorLayer-like object that the existing FetchWfsCapabilities expects
  const vectorLayerForFetch = {
    vector_layer_id: null, // Not needed for service-only fetch
    wfs_service_id: row.wfs_service_id,
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
        <FetchWfsCapabilities
          vectorLayer={vectorLayerForFetch}
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
