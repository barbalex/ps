import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Field, Textarea } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../SqlInitializer'
import { Ui_options as UiOption } from '../../generated/client'
import { SwitchField } from './SwitchField'
// TODO:
// maybe generalize this component for all geometry editing
// and move it to the shared folder
export const EditingGeometry = ({ row, table }) => {
  const id =
    table === 'places'
      ? row.place_id
      : table === 'checks'
      ? row.check_id
      : table === 'actions'
      ? row.action_id
      : null

  const fieldName =
    table === 'places'
      ? 'editing_place_geometry'
      : table === 'checks'
      ? 'editing_check_geometry'
      : table === 'actions'
      ? 'editing_action_geometry'
      : null

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const editedId = uiOption?.[fieldName] ?? null

  const onChange = useCallback(
    (e, data) => {
      db.ui_options.update({
        where: { user_id },
        data: { [fieldName]: data.checked ? id : null },
      })
    },
    [db.ui_options, id, fieldName],
  )

  const value = row.geometry ? JSON.stringify(row.geometry, null, 3) : ''
  const lineCount = value ? value.split(/\r\n|\r|\n/).length : 1

  return (
    <Field label="Geometry">
      <SwitchField
        label="Edit"
        name={fieldName}
        value={id === editedId}
        onChange={onChange}
      />
      <Textarea
        value={row.geometry ? JSON.stringify(row.geometry, null, 3) : ''}
        appearance="outline"
        resize="vertical"
        rows={lineCount}
        className="geometry-textarea"
      />
    </Field>
  )
}
