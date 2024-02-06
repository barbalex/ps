import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Field, Textarea } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../../components/SqlInitializer'
import { Ui_options as UiOption } from '../../generated/client'
import { SwitchField } from '../../components/shared/SwitchField'
// TODO:
// maybe generalize this component for all geometry editing
// and move it to the shared folder
export const EditingGeometry = ({ row }) => {
  const { place_id } = row

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const editedPlaceGeometry = uiOption?.editing_place_geometry ?? null

  const onChange = useCallback(
    (e, data) => {
      db.ui_options.update({
        where: { user_id },
        data: { editing_place_geometry: data.checked ? place_id : null },
      })
    },
    [db.ui_options, place_id],
  )

  const value = row.geometry ? JSON.stringify(row.geometry, null, 3) : ''
  const lineCount = value ? value.split(/\r\n|\r|\n/).length : 1

  return (
    <>
      <SwitchField
        label="Edit geometry"
        name="editing_place_geometry"
        value={place_id === editedPlaceGeometry}
        onChange={onChange}
      />
      <Field label="Geometry">
        <Textarea
          value={row.geometry ? JSON.stringify(row.geometry, null, 3) : ''}
          appearance="outline"
          resize="vertical"
          rows={lineCount}
          className="geometry-textarea"
        />
      </Field>
    </>
  )
}
