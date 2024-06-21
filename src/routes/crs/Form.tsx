import { memo } from 'react'
import { useOutletContext } from 'react-router-dom'

import { TextField } from '../../components/shared/TextField.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(
  ({ onChange: onChangeFromProps, row: rowFromProps, autoFocusRef }) => {
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = rowFromProps ?? outletContext?.row ?? {}

    return (
      <>
        <TextField
          label="Auth Name"
          name="auth_name"
          type="auth_name"
          value={row.auth_name ?? ''}
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
        <TextField
          label="Type"
          name="type"
          type="type"
          value={row.type ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Area of Use"
          name="area_of_use"
          type="area_of_use"
          value={row.area_of_use ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Projection Method Name"
          name="projection_method_name"
          type="projection_method_name"
          value={row.projection_method_name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
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
