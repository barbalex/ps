import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../../components/SqlInitializer'
import { Ui_options as UiOption } from '../../generated/client'
import { SwitchField } from '../../components/shared/SwitchField'

// TODO:
// maybe generalize this component for all geometry editing
// and move it to the shared folder
export const EditingGeometry = ({ place_id }) => {
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

  return (
    <SwitchField
      label="Edit geometry"
      name="editing_place_geometry"
      value={place_id === editedPlaceGeometry}
      onChange={onChange}
    />
  )
}
