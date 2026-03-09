import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToolbarToggleButton } = fluentUiReactComponents
import { FaDrawPolygon } from 'react-icons/fa'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'

import {
  editingPlaceGeometryAtom,
  editingCheckGeometryAtom,
  editingActionGeometryAtom,
  tabsAtom,
} from '../../../../store.ts'

export const EditingGeometryButton = () => {
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

  const pathArray = useLocation()
    .pathname.split('/')
    .filter((p) => !!p)

  const last = pathArray[pathArray.length - 1]
  const secondToLast = pathArray[pathArray.length - 2]

  // Detect table and id from either `{id}/place` or `places/{id}` patterns
  let table: string | null = null
  let id: string | null = null

  if (last === 'place' || last === 'check' || last === 'action') {
    table = last
    id = secondToLast
  } else if (secondToLast === 'places') {
    table = 'place'
    id = last
  } else if (secondToLast === 'checks') {
    table = 'check'
    id = last
  } else if (secondToLast === 'actions') {
    table = 'action'
    id = last
  }

  const isEditable = table !== null

  const isActive =
    (table === 'place' && editingPlaceGeometry === id) ||
    (table === 'check' && editingCheckGeometry === id) ||
    (table === 'action' && editingActionGeometry === id)

  const onClick = () => {
    if (!isEditable) return

    const enabling = !isActive

    if (enabling && !tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }

    switch (table) {
      case 'place':
        setEditingPlaceGeometry(enabling ? id : null)
        break
      case 'check':
        setEditingCheckGeometry(enabling ? id : null)
        break
      case 'action':
        setEditingActionGeometry(enabling ? id : null)
        break
    }
  }

  return (
    <ToolbarToggleButton
      name="edit_geometry"
      value={isActive}
      onClick={onClick}
      disabled={!isEditable}
      aria-label={isActive ? 'Stop editing geometry' : 'Edit geometry'}
      title={isActive ? 'Stop editing geometry' : 'Edit geometry'}
      icon={<FaDrawPolygon />}
      size="large"
    />
  )
}
