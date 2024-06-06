import { memo } from 'react'
import { useOutletContext } from 'react-router-dom'

import { DateField } from '../../components/shared/DateField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { EditingGeometry } from '../../components/shared/EditingGeometry.tsx'

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
        <DateField
          label="Date"
          name="date"
          value={row.date}
          onChange={onChange}
        />
        <SwitchField
          label="relevant for reports"
          name="relevant_for_reports"
          value={row.relevant_for_reports}
          onChange={onChange}
        />
        <Jsonb
          table="checks"
          idField="check_id"
          id={row.check_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
        <EditingGeometry row={row} table="checks" />
      </>
    )
  },
)
