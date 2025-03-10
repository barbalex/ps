import { memo, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'

import { DateField } from '../../components/shared/DateField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { EditingGeometry } from '../../components/shared/EditingGeometry.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(
  ({ onChange: onChangeFromProps, row: rowFromProps, autoFocusRef }) => {
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = useMemo(
      () => rowFromProps ?? outletContext?.row ?? {},
      [outletContext?.row, rowFromProps],
    )
    const orIndex = outletContext?.orIndex

    // need to extract the jsonb data from the row
    // as inside filters it's name is a path
    // instead of it being inside of the data field
    const jsonbData = useMemo(() => jsonbDataFromRow(row), [row])

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
          data={jsonbData}
          orIndex={orIndex}
          autoFocus
          ref={autoFocusRef}
        />
        <EditingGeometry
          row={row}
          table="checks"
        />
      </>
    )
  },
)
