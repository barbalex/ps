import { useMemo, memo } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { EditingGeometry } from '../../components/shared/EditingGeometry.tsx'

import '../../form.css'

export const Component = memo(
  ({ onChange: onChangeFromProps, row: rowFromProps, autoFocusRef }) => {
    const { subproject_id } = useParams()

    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = rowFromProps ?? outletContext?.row ?? {}

    // TODO: only show parent place if level 2 exists in place_levels
    const parentPlaceWhere = useMemo(
      () => ({ level: 1, subproject_id }),
      [subproject_id],
    )

    return (
      <div className="form-container">
        <TextFieldInactive label="ID" name="place_id" value={row.place_id} />
        <RadioGroupField
          label="Level"
          name="level"
          list={[1, 2]}
          value={row.level ?? ''}
          onChange={onChange}
        />
        {row.level === 2 && (
          <DropdownField
            label="Parent Place"
            name="parent_id"
            idField="place_id"
            table="places"
            where={parentPlaceWhere}
            value={row.parent_id ?? ''}
            onChange={onChange}
            autoFocus
            ref={autoFocusRef}
          />
        )}
        <TextField
          label="Since when does this place exist? (year)"
          name="since"
          value={row.since}
          type="number"
          onChange={onChange}
        />
        <TextField
          label="Until when did this place exist? (year)"
          name="until"
          value={row.until}
          type="number"
          onChange={onChange}
        />
        <Jsonb
          table="places"
          idField="place_id"
          id={row.place_id}
          data={row.data ?? {}}
          autoFocus={row.level !== 2}
          ref={row.level !== 2 ? autoFocusRef : undefined}
        />
        <EditingGeometry row={row} table="places" />
      </div>
    )
  },
)
