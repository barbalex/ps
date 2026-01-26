import { useParams, useLocation } from '@tanstack/react-router'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { EditingGeometry } from '../../components/shared/EditingGeometry.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

export const PlaceForm = ({
  onChange,
  validations,
  row,
  orIndex,
  from,
  autoFocusRef,
}) => {
  const { subprojectId } = useParams({ from })
  const { pathname } = useLocation()
  const isFilter = pathname.endsWith('filter')

  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

  // TODO: only show parent place if level 2 exists in place_levels
  const parentPlaceWhere = `level = 1 and subproject_id = '${subprojectId}'`

  return (
    <div className="form-container">
      {!isFilter && (
        <>
          <RadioGroupField
            label="Level"
            name="level"
            list={[1, 2]}
            value={row.level ?? ''}
            onChange={onChange}
            validationState={validations?.level?.state}
            validationMessage={validations?.level?.message}
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
              validationState={validations?.parent_id?.state}
              validationMessage={validations?.parent_id?.message}
            />
          )}
        </>
      )}
      <TextField
        label="Since when does this place exist? (year)"
        name="since"
        value={row.since}
        type="number"
        onChange={onChange}
        validationState={validations?.since?.state}
        validationMessage={validations?.since?.message}
      />
      <TextField
        label="Until when did this place exist? (year)"
        name="until"
        value={row.until}
        type="number"
        onChange={onChange}
        validationState={validations?.until?.state}
        validationMessage={validations?.until?.message}
      />
      <Jsonb
        table="places"
        idField="place_id"
        id={row.place_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
        autoFocus={row.level !== 2}
        ref={row.level !== 2 ? autoFocusRef : undefined}
      />
      <EditingGeometry row={row} table="places" />
    </div>
  )
}
