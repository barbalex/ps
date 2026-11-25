import { useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Tooltip, ToolbarToggleButton } = fluentUiReactComponents
import { FaHandPointer } from 'react-icons/fa'
import { useAtom } from 'jotai'
import { useMap } from 'react-leaflet'
import { useIntl } from 'react-intl'

import { choosingGeometryAtom } from '../../../../store.ts'

import styles from './index.module.css'

// same signal color MeasureButton uses to mark an active mode (the icon
// signals the state because ToolbarToggleButton's checked state is owned
// by the enclosing Toolbar)
const ACTIVE_COLOR = '#f45942'

// toggled on the map container while the choosing tool is active so CSS can
// adapt the cursor; ClickListener branches on the atom, not the class
const CHOOSING_GEOMETRY_ACTIVE_CLASS = 'choosing-geometry-active'

// Activates the choosing tool: the next click on a geometry of an own layer
// (places/checks/actions) starts editing that geometry — one click instead
// of click → info drawer → edit button. Escape leaves the mode.
export const ChooseGeometryButton = () => {
  const map = useMap()
  const { formatMessage } = useIntl()
  const [choosingGeometry, setChoosingGeometry] = useAtom(choosingGeometryAtom)

  useEffect(() => {
    if (!choosingGeometry) return

    map.getContainer()?.classList.add(CHOOSING_GEOMETRY_ACTIVE_CLASS)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChoosingGeometry(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      map.getContainer()?.classList.remove(CHOOSING_GEOMETRY_ACTIVE_CLASS)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [map, choosingGeometry, setChoosingGeometry])

  const label =
    choosingGeometry ?
      formatMessage({
        id: 'mapChooseGeometryStop',
        defaultMessage: 'Geometrie-Auswahl beenden',
      })
    : formatMessage({
        id: 'mapChooseGeometry',
        defaultMessage: 'Geometrie wählen, um sie zu bearbeiten',
      })

  return (
    <Tooltip content={label} relationship="label">
      <ToolbarToggleButton
        name="choose_geometry"
        value={choosingGeometry as unknown as string}
        onClick={() => setChoosingGeometry(!choosingGeometry)}
        icon={<FaHandPointer />}
        size="large"
        className={styles.toolbarButton}
        style={choosingGeometry ? { color: ACTIVE_COLOR } : undefined}
      />
    </Tooltip>
  )
}
