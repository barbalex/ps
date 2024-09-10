import { useCallback, memo } from 'react'
import { Field, Textarea } from '@fluentui/react-components'
import { useAtom, useSetAtom } from 'jotai'

import { SwitchField } from './SwitchField.tsx'
import {
  tabsAtom,
  editingPlaceGeometryAtom,
  editingActionGeometryAtom,
  editingCheckGeometryAtom,
} from '../../store.ts'
// TODO:
// maybe generalize this component for all geometry editing
// and move it to the shared folder
export const EditingGeometry = memo(({ row, table }) => {
  const setEditingPlaceGeometry = useSetAtom(editingPlaceGeometryAtom)
  const setEditingCheckGeometry = useSetAtom(editingCheckGeometryAtom)
  const setEditingActionGeometry = useSetAtom(editingActionGeometryAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)

  const onChange = useCallback(
    async (e, data) => {
      // 1. if checked, show map if not already shown
      if (data.checked) {
        if (!tabs.includes('map')) {
          setTabs([...tabs, 'map'])
        }
      }
      // 2. update the editing state
      switch (table) {
        case 'places':
          setEditingPlaceGeometry(data.checked ? row.place_id : null)
          break
        case 'checks':
          setEditingCheckGeometry(data.checked ? row.check_id : null)
          break
        case 'actions':
          setEditingActionGeometry(data.checked ? row.action_id : null)
          break
      }
    },
    [
      table,
      tabs,
      setTabs,
      setEditingPlaceGeometry,
      row.place_id,
      row.check_id,
      row.action_id,
      setEditingCheckGeometry,
      setEditingActionGeometry,
    ],
  )

  const value = row.geometry ? JSON.stringify(row.geometry, null, 3) : ''
  const lineCount = value ? value.split(/\r\n|\r|\n/).length : 1

  return (
    <Field label="Geometry">
      <SwitchField
        label="Edit"
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
