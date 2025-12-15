import { useParams, useNavigate } from '@tanstack/react-router'
import TreasureMapLine from '../../images/treasure-map-line.svg?react'
import TreasureMapLinePulsating from '../../images/treasure-map-line-pulsating.svg?react'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
} from '@fluentui/react-components'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import {
  tabsAtom,
  draggableLayersAtom,
  droppableLayerAtom,
  addOperationAtom,
} from '../../store.ts'

// type props

export const Header = ({ autoFocusRef, row, from }) => {
  const isForm =
    from ===
    '/data/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer'
  const setDroppableLayer = useSetAtom(droppableLayerAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [draggableLayers, setDraggableLayers] = useAtom(draggableLayersAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const { projectId, vectorLayerId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  // need to:
  // 1. lowercase all
  // 2. replace all spaces with -
  const layerNameForState = row.label?.replace?.(/ /g, '-')?.toLowerCase?.()
  const isDraggable = draggableLayers.includes(layerNameForState)

  const onClickToggleAssign = () => {
    let newDraggableLayers = []
    // 1. if isDraggable, remove from draggableLayers
    if (isDraggable) {
      // remove from draggableLayers
      newDraggableLayers = draggableLayers?.filter(
        (layer) => layer !== layerNameForState,
      )
    } else {
      // add to draggableLayers
      newDraggableLayers = [...draggableLayers, layerNameForState]
    }
    setDraggableLayers(newDraggableLayers)
  }

  const onClickAssignToPlaces = async () => {
    if (isDraggable) return
    // map needs to be visible
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }
    // this layer needs to be active
    const res = await db.query(
      `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
      [row.vector_layer_id],
    )
    const layerPresentation = res?.rows?.[0]
    if (!layerPresentation.active) {
      db.query(
        `UPDATE layer_presentations SET active = true WHERE layer_presentation_id = $1`,
        [layerPresentation.layer_presentation_id],
      )
      addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: layerPresentation.layer_presentation_id,
        operation: 'update',
        draft: { active: true },
        prev: { ...layerPresentation },
      })
    }
  }

  const onClickAssignToPlaces1 = () => {
    setDroppableLayer('places1')
    onClickToggleAssign()
    onClickAssignToPlaces()
  }

  const onClickAssignToPlaces2 = () => {
    setDroppableLayer('places2')
    onClickToggleAssign()
    onClickAssignToPlaces()
  }

  const addRow = async () => {
    const vectorLayer = await createVectorLayer({
      projectId,
      type: 'wfs',
      db,
    })
    // also add vector_layer_display
    createVectorLayerDisplay({
      vectorLayerId: vectorLayer.vector_layer_id,
      db,
    })
    // add layer_presentation
    await createLayerPresentation({
      vectorLayerId: vectorLayer.vector_layer_id,
      db,
    })
    navigate({
      to:
        isForm ?
          `../../${vectorLayer.vector_layer_id}/vector-layer`
        : `../${vectorLayer.vector_layer_id}/vector-layer`,
      params: (prev) => ({
        ...prev,
        vectorLayerId: vectorLayer.vector_layer_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM vector_layers WHERE vector_layer_id = $1`, [
      vectorLayerId,
    ])
    navigate({ to: isForm ? `../..` : `..` })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT vector_layer_id FROM vector_layers WHERE project_id = $1 order by label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.vector_layer_id === vectorLayerId)
    const next = rows[(index + 1) % len]
    navigate({
      to:
        isForm ?
          `../../${next.vector_layer_id}/vector-layer`
        : `../${next.vector_layer_id}`,
      params: (prev) => ({
        ...prev,
        vectorLayerId: next.vector_layer_id,
      }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT vector_layer_id FROM vector_layers WHERE project_id = $1 order by label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.vector_layer_id === vectorLayerId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to:
        isForm ?
          `../../${previous.vector_layer_id}/vector-layer`
        : `../${previous.vector_layer_id}`,
      params: (prev) => ({
        ...prev,
        vectorLayerId: previous.vector_layer_id,
      }),
    })
  }

  return (
    <FormHeader
      title="Vector Layer"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="vector layer"
      siblings={
        isDraggable ?
          <Button
            size="medium"
            icon={<TreasureMapLinePulsating />}
            onClick={onClickToggleAssign}
            title="Stop assigning"
          />
        : <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                size="medium"
                icon={<TreasureMapLine />}
                title="Start assigning"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={onClickAssignToPlaces1}>Places 1</MenuItem>
                <MenuItem onClick={onClickAssignToPlaces2}>Places 2</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
      }
    />
  )
}
