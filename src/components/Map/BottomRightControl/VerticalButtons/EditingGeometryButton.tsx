import * as fluentUiReactComponents from '@fluentui/react-components'
const { Tooltip, ToolbarToggleButton } = fluentUiReactComponents
import { FaDrawPolygon } from 'react-icons/fa'
import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { useLocation } from '@tanstack/react-router'
import { useContext } from 'react'
import { ProjectAreasContext } from '../../../../modules/projectAreas.ts'
import { mapCreationAtom } from '../../../../modules/mapCreation.ts'

import {
  editingPlaceGeometryAtom,
  editingProjectGeometryAtom,
  editingCheckGeometryAtom,
  editingActionGeometryAtom,
} from '../../../../store.ts'
import { useUrlPanes } from '../../../../modules/useUrlPanes.ts'

import styles from './index.module.css'

export const EditingGeometryButton = () => {
  const { current } = useContext(ProjectAreasContext)
  const setCreation = useSetAtom(mapCreationAtom)
  const [editingProject, setEditingProject] = useAtom(editingProjectGeometryAtom)
  const [editingPlaceGeometry, setEditingPlaceGeometry] = useAtom(
    editingPlaceGeometryAtom,
  )
  const [editingCheckGeometry, setEditingCheckGeometry] = useAtom(
    editingCheckGeometryAtom,
  )
  const [editingActionGeometry, setEditingActionGeometry] = useAtom(
    editingActionGeometryAtom,
  )
  const [tabs, setTabs] = useUrlPanes()

  const pathArray = useLocation()
    .pathname.split('/')
    .filter((p) => !!p)

  const last = pathArray[pathArray.length - 1]
  const secondToLast = pathArray[pathArray.length - 2]

  // Detect table and id from either `{id}/place` or `places/{id}` patterns
  let table: string | null = null
  let id: string | null = null

  if (last === 'project' || last === 'place' || last === 'check' || last === 'action') {
    table = last
    id = secondToLast
  } else if (secondToLast === 'projects') {
    table = 'project'
    id = last
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

  const isEditable = table !== null && (table !== 'project' || (current?.project_id === id && current.can_design))
  const { formatMessage } = useIntl()

  const isActive =
    (table === 'project' && editingProject === id) ||
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
      case 'project':
        if (enabling) setCreation(null)
        setEditingProject(enabling ? id : null)
        break
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

  const label = isActive
    ? formatMessage({ id: 'bMapInfoStopEditGeometry', defaultMessage: 'Bearbeiten der Geometrie beenden' })
    : formatMessage({ id: 'XOi0Ut', defaultMessage: 'Geometrie bearbeiten' })
  return (
    <Tooltip content={label} relationship="label">
      <ToolbarToggleButton
        name="edit_geometry"
        value={isActive as unknown as string}
        onClick={onClick}
        disabledFocusable={!isEditable}
        icon={<FaDrawPolygon />}
        size="large"
        className={styles.toolbarButton}
      />
    </Tooltip>
  )
}
