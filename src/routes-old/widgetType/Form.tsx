import { memo } from 'react'
import { useOutletContext } from 'react-router'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'

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
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <SwitchField
          label="Needs a list"
          name="needs_list"
          value={row.needs_list ?? false}
          onChange={onChange}
        />
        <TextField
          label="Sort value"
          name="sort"
          value={row.sort ?? ''}
          type="number"
          onChange={onChange}
        />
        <TextField
          label="Comment"
          name="comment"
          value={row.comment ?? ''}
          onChange={onChange}
        />
      </>
    )
  },
)
