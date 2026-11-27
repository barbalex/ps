import type { ComponentProps, FC } from 'react'
import { useState } from 'react'
import { GeometryImportDialog } from '../shared/GeometryImport.tsx'
import { TbPolygon, TbPolygonOff } from 'react-icons/tb'
import * as fluentUiReactComponents from '@fluentui/react-components'
import type { MenuCheckedValueChangeData } from '@fluentui/react-components'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { createLayerPresentation } from '../../modules/createRows.ts'
import {
  extentFromRow,
  extentSelect,
  extentToBoundsWithMargin,
  type ExtentRow,
} from '../../modules/geoQueries.ts'
import { useLayerActivation } from '../../modules/useLayerActivation.ts'
import { useUrlLayers } from '../../modules/useUrlLayers.ts'
import { mapCreationAtom } from '../../modules/mapCreation.ts'
import { useUrlPanes } from '../../modules/useUrlPanes.ts'
import {
  editingActionGeometryAtom,
  editingCheckGeometryAtom,
  editingPlaceGeometryAtom,
  editingProjectGeometryAtom,
  mapBoundsAtom,
} from '../../store.ts'
import styles from './Geometry.module.css'

const {
  Button,
  Menu,
  MenuItem,
  MenuItemCheckbox,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tooltip: TooltipComponent,
} = fluentUiReactComponents

// Fluent's Tooltip types require a `relationship` prop that is not passed here
const Tooltip = TooltipComponent as FC<
  Partial<ComponentProps<typeof TooltipComponent>>
>

// the own tables whose rows carry a user-editable geometry
const OWN_TABLES = {
  projects: { idName: 'project_id', editingAtom: editingProjectGeometryAtom },
  places: { idName: 'place_id', editingAtom: editingPlaceGeometryAtom },
  checks: { idName: 'check_id', editingAtom: editingCheckGeometryAtom },
  actions: { idName: 'action_id', editingAtom: editingActionGeometryAtom },
} as const

// the menu's checkbox item, checked while the row's geometry is being edited
const EDITING_NAME = 'editing'
const EDITING_VALUE = 'on'

// row of the vector_layers / layer_presentations join below
type OwnTableLayerRow = {
  vector_layer_id: string | null
  layer_presentation_id: string | null
  active: boolean | null
}

interface Props {
  /** id of that row. Nothing is rendered
   * without one (the route params are not known yet) */
  rowId: string | undefined
  editable?: boolean
  /** DrawControl follows the active row's route. A map hit can be off-route. */
  selectRow?: () => Promise<void>
}
type GeometryProps = Props &
  (
    | { table: 'projects'; level?: never }
    | { table: Exclude<keyof typeof OWN_TABLES, 'projects'>; level: 1 | 2 }
  )

/**
 * The project / place / action / check forms' header menu for the row's geometry.
 * The trigger shows whether a geometry exists (slashed polygon: none yet).
 * "Bearbeiten" toggles editing on the map (the DrawControl follows the
 * editing atom); switching it on opens the map and zooms to the geometry if
 * there is one. "Zoomen" only opens the map and zooms.
 */
export const Geometry = ({
  table,
  rowId,
  level,
  selectRow,
  editable = true,
}: GeometryProps) => {
  const { formatMessage } = useIntl()
  const [importOpen, setImportOpen] = useState(false)
  const { projectId } = useParams({ strict: false })
  const db = usePGlite()
  const [panes, setPanes] = useUrlPanes()
  const { activateLayer, joinRenderList } = useLayerActivation()
  const { layers, setLayerVisible } = useUrlLayers()
  const setCreation = useSetAtom(mapCreationAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const { idName, editingAtom } = OWN_TABLES[table]
  const [editingId, setEditingId] = useAtom<
    string | null | false, [string | null], void
  >(editingAtom)

  // the row's extent, live. It is what "zoomen" fits the map to and what
  // says whether a geometry exists (queryExtent's notion: no geometry or an
  // empty one, e.g. a GeometryCollection without parts, has no extent)
  const extentRes = useLiveQuery(
    rowId ?
      `SELECT ${extentSelect()} FROM ${table} WHERE ${idName} = $1`
    : `SELECT 1 WHERE false`,
    rowId ? [rowId] : [],
  )

  // no row known yet
  if (!rowId) return null

  const extent = extentFromRow(extentRes?.rows?.[0] as ExtentRow | undefined)
  // undefined while the extent is loading: the trigger must not flash
  // "no geometry" for a row that has one
  const hasGeometry = extentRes === undefined ? undefined : extent !== null
  if (!editable && !hasGeometry) return null
  const isEditing = editingId === rowId

  // opens the map and, if the row has a geometry, shows the layer that
  // draws it and fits the map to it
  const showOnMap = async () => {
    // 1. show map if not happening
    if (!panes.includes('map')) await setPanes([...panes, 'map'])
    if (table === 'projects') {
      const { rows } = await db.query<{ layer_presentation_id: string }>(
        `SELECT lp.layer_presentation_id FROM vector_layers vl
         JOIN layer_presentations lp USING (vector_layer_id)
         WHERE vl.project_id = $1 AND vl.own_table = 'current_project_area'
         ORDER BY lp.active DESC, lp.layer_presentation_id LIMIT 1`, [rowId],
      )
      const presentation = rows[0]?.layer_presentation_id
      if (presentation && !layers.includes(presentation)) setLayerVisible(presentation, true)
      if (extent) setMapBounds(extentToBoundsWithMargin(extent))
      return
    }
    if (!extent) return

    // 2. activate the layer if not active. Best effort: failing here (e.g.
    // no permission to write layer_presentations) must not keep the map
    // from zooming
    try {
      const layerRes = await db.query<OwnTableLayerRow>(
        `SELECT vl.vector_layer_id, lp.layer_presentation_id, lp.active
        FROM vector_layers vl
          LEFT JOIN layer_presentations lp ON lp.vector_layer_id = vl.vector_layer_id
        WHERE vl.project_id = $1 AND vl.own_table = $2 AND vl.own_table_level = $3
        ORDER BY lp.active DESC, lp.layer_presentation_id
        LIMIT 1`,
        [projectId, table, level],
      )
      const layer = layerRes?.rows?.[0]
      if (!layer?.layer_presentation_id && layer?.vector_layer_id) {
        const layerPresentationId = await createLayerPresentation({
          vectorLayerId: layer.vector_layer_id,
          active: true,
        })
        if (layerPresentationId) joinRenderList(layerPresentationId)
      } else if (layer?.layer_presentation_id) {
        if (layer.active) joinRenderList(layer.layer_presentation_id)
        else await activateLayer(layer.layer_presentation_id)
      }
    } catch (error) {
      console.error('Could not activate the layer before zooming:', error)
    }

    // 3. zoom to the row
    setMapBounds(extentToBoundsWithMargin(extent))
  }

  const onChangeEditing = async (
    _e: unknown,
    { checkedItems }: MenuCheckedValueChangeData,
  ) => {
    const enabling = checkedItems.includes(EDITING_VALUE)
    if (enabling && !editable) return
    if (enabling) {
      if (table === 'projects') setCreation(null)
      await selectRow?.()
    }
    setEditingId(enabling ? rowId : null)
    if (enabling) await showOnMap()
  }

  const onClickZoom = () => void showOnMap()

  // the button is icon-only: the label makes it accessible (and testable) —
  // Fluent's tooltip content does not become its accessible name
  const triggerLabel =
    !editable ? formatMessage({ id: 'uQAMae', defaultMessage: 'Zoomen' })
    : hasGeometry === false ?
      formatMessage({
        id: 'Q4WpBK',
        defaultMessage: 'Geometrie erfassen',
      })
    : formatMessage({
        id: 'XOi0Ut',
        defaultMessage: 'Geometrie bearbeiten',
      })

  return (
    <>
    <Menu
      openOnHover={false}
      checkedValues={{
        [EDITING_NAME]: isEditing ? [EDITING_VALUE] : [],
      }}
      onCheckedValueChange={onChangeEditing}
    >
      <MenuTrigger>
        <Tooltip content={triggerLabel}>
          <Button
            size="medium"
            aria-label={triggerLabel}
            icon={
              <span className={isEditing ? styles.editing : undefined}>
                {hasGeometry === false ?
                  <TbPolygonOff />
                : <TbPolygon />}
              </span>
            }
          />
        </Tooltip>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItemCheckbox
            disabled={!editable}
            name={EDITING_NAME}
            value={EDITING_VALUE}
            // the item navigates (opens the map): close the menu like the
            // other header menus do
            persistOnClick={false}
          >
            {hasGeometry === false ?
              formatMessage({ id: '7p1UxO', defaultMessage: 'Erfassen' })
            : formatMessage({ id: 'bCYCZD', defaultMessage: 'Bearbeiten' })}
          </MenuItemCheckbox>
          {editable && <MenuItem disabled={isEditing} onClick={() => setImportOpen(true)}>
            {formatMessage({ id: 'geometryImport', defaultMessage: 'Geometrien importieren' })}
          </MenuItem>}
          <MenuItem
            disabled={hasGeometry !== true}
            onClick={onClickZoom}
          >
            {formatMessage({ id: 'uQAMae', defaultMessage: 'Zoomen' })}
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
    {importOpen && editable && <GeometryImportDialog key={rowId} target={{ table, rowId }} close={() => setImportOpen(false)} />}
    </>
  )
}
