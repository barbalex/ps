import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Field, Textarea } from '@fluentui/react-components'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../ElectricProvider'
import { SwitchField } from './SwitchField'
// TODO:
// maybe generalize this component for all geometry editing
// and move it to the shared folder
export const EditingGeometry = memo(({ row, table }) => {
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

  const { user: authUser } = useCorbadoSession()
  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveUnique({ where: { user_email: authUser?.email } }),
  )
  const editedId = appState?.[fieldName] ?? null

  const onChange = useCallback(
    async (e, data) => {
      // 1. if checked, show map if not already shown
      if (data.checked) {
        const tabs = appState?.tabs ?? []
        if (!tabs.includes('map')) {
          await db.app_states.update({
            where: { user_email: authUser?.email },
            data: { tabs: [...tabs, 'map'] },
          })
        }
      }
      // 2. update the editing id
      db.app_states.update({
        where: { user_email: authUser?.email },
        data: { [fieldName]: data.checked ? id : null },
      })
    },
    [db.app_states, authUser?.email, fieldName, id, appState?.tabs],
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
})
