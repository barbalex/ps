import { memo } from 'react'
import { useOutletContext } from 'react-router-dom'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { ComboboxFilteringOptions } from '../../components/shared/ComboboxFilteringOptions/index.tsx'
import * as crsDataImport from './crs.json'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(
  ({ onChange: onChangeFromProps, row: rowFromProps, autoFocusRef }) => {
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = rowFromProps ?? outletContext?.row ?? {}

    const crsData = crsDataImport.default

    console.log('CRS Form, crsData:', crsData)

    return (
      <>
        <ComboboxFilteringOptions
          name="code"
          label="Code"
          options={crsData.map((d) => ({
            label: d.name,
            value: d.code,
          }))}
          value={row.code}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Code"
          name="code"
          type="code"
          value={row.code ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Name"
          name="name"
          type="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextArea
          label="Proj4 Value"
          name="proj4"
          type="proj4"
          value={row.proj4 ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
      </>
    )
  },
)
