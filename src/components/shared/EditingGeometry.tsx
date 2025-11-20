import { Field, Textarea } from '@fluentui/react-components'
import { useAtom } from 'jotai'

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
export const EditingGeometry = ({ row, table }) => {
  const [editingPlaceGeometry, setEditingPlaceGeometry] = useAtom(
    editingPlaceGeometryAtom,
  )
  const [editingCheckGeometry, setEditingCheckGeometry] = useAtom(
    editingCheckGeometryAtom,
  )
  const [editingActionGeometry, setEditingActionGeometry] = useAtom(
    editingActionGeometryAtom,
  )
  const [tabs, setTabs] = useAtom(tabsAtom)

  const onChange = async (e, data) => {
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
  }

  const value = row.geometry ? JSON.stringify(row.geometry, null, 3) : ''
  const lineCount = value ? value.split(/\r\n|\r|\n/).length : 1

  const switchFieldValue =
    table === 'places' ? row.place_id === editingPlaceGeometry
    : table === 'checks' ? row.check_id === editingCheckGeometry
    : row.action_id === editingActionGeometry

  return (
    <Field label="Geometry">
      <SwitchField
        label="Edit"
        value={switchFieldValue}
        onChange={onChange}
      />
      {switchFieldValue && !!row.geometry && (
        <Textarea
          value={row.geometry ? JSON.stringify(row.geometry, null, 3) : ''}
          appearance="outline"
          resize="vertical"
          rows={lineCount}
          className="geometry-textarea"
        />
      )}
    </Field>
  )
}
