import { memo } from 'react'
import { useOutletContext } from 'react-router'

import { DropdownField } from '../../components/shared/DropdownField.tsx'

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
        <DropdownField
          label="Field type"
          name="field_type_id"
          table="field_types"
          value={row.field_type_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <DropdownField
          label="Widget type"
          name="widget_type_id"
          table="widget_types"
          value={row.widget_type_id ?? ''}
          onChange={onChange}
        />
      </>
    )
  },
)
